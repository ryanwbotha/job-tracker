const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const fs = require("fs");
const path = require("path");

function getApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  try {
    const envPath = path.resolve(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

function getPromptForMode(mode, resumeText, jobDescription) {
  if (mode === "professionalEvaluation") {
    return (
      "You are an experienced Technical Human Resource Manager specializing in software engineering, data science, tech leadership, and product roles. Your task is to review the provided resume against the job description.\n" +
      "Please share your professional evaluation on whether the candidate's profile aligns with the role. Highlight the strengths and weaknesses of the applicant against the specified job requirements.\n\n" +
      "Return a JSON response matching this structure exactly:\n" +
      "{\n" +
      '  "alignment_score": <number between 0 and 100>,\n' +
      '  "strengths": [<list of candidate\'s key strengths for this role>],\n' +
      '  "weaknesses": [<list of candidate\'s key weaknesses or alignment gaps for this role>],\n' +
      '  "evaluation_summary": "<detailed HR evaluation statement, about 4-6 sentences, highlighting candidate\'s overall suitability>"\n' +
      "}\n\n" +
      `Resume:\n${resumeText}\n\n` +
      `Job Description:\n${jobDescription}\n`
    );
  } else if (mode === "skillsImprovement") {
    return (
      "You are an experienced Technical Recruiter and Career Coach specializing in tech roles. Your task is to review the provided resume against the job description.\n" +
      "Please share your professional evaluation on how the candidate can improve their skills. Highlight specific areas of improvement and provide concrete, actionable recommendations on how to acquire these skills or represent them better.\n\n" +
      "Return a JSON response matching this structure exactly:\n" +
      "{\n" +
      '  "priority_skills_to_add": [<list of key technical skills/tools the candidate lacks from the JD>],\n' +
      '  "certifications_recommendations": [<list of recommended certifications, courses, or study areas>],\n' +
      '  "bullet_point_improvements": [\n' +
      "    {\n" +
      '      "original": "<original text or concept from resume to improve>",\n' +
      '      "improved": "<improved version incorporating keywords, action verbs, or impact metrics>"\n' +
      "    }\n" +
      "  ]\n" +
      "}\n\n" +
      `Resume:\n${resumeText}\n\n` +
      `Job Description:\n${jobDescription}\n`
    );
  } else {
    // Default to atsMatch
    return (
      "You are a skilled and very experienced ATS (Application Tracking System) parser and optimizer with a deep understanding of tech and professional roles. Your task is to evaluate the resume based on the given job description.\n" +
      "You must consider the job market is very competitive and you should provide the best assistance for improving the resumes.\n" +
      "Assign the percentage matching based on the job description and the missing keywords with high accuracy.\n\n" +
      "Return a JSON response matching this structure exactly:\n" +
      "{\n" +
      '  "match_percentage": <number between 0 and 100>,\n' +
      '  "matching_skills": [<list of technical skills and qualifications present in both>],\n' +
      '  "missing_keywords": [<list of important technical skills/keywords from job description missing in resume>],\n' +
      '  "profile_summary": "<brief professional analysis of the candidate\'s strengths and weaknesses in 3-4 sentences>"\n' +
      "}\n\n" +
      `Resume:\n${resumeText}\n\n` +
      `Job Description:\n${jobDescription}\n`
    );
  }
}

async function callGemini(prompt, apiKey) {
  const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson.error?.message || `API error (${response.status}) on model ${model}`);
        logger.warn(`Model ${model} failed, trying next fallback...`, errJson);
        continue;
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        lastError = new Error(`Empty response from Gemini API model ${model}`);
        continue;
      }

      return JSON.parse(textResponse);
    } catch (e) {
      lastError = e;
      logger.warn(`Exception during Gemini call on ${model}:`, e);
    }
  }

  throw lastError || new Error("Failed to get response from Gemini API");
}

exports.evaluateResume = onCall(async (request) => {
  const { resumeText, jobDescription, mode = "atsMatch", prompt: customPrompt } = request.data || {};

  if (!customPrompt && (!resumeText || !jobDescription)) {
    throw new HttpsError("invalid-argument", "Missing required parameters: resumeText and jobDescription.");
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    logger.error("GEMINI_API_KEY environment variable not set.");
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY not configured on server.");
  }

  const prompt = customPrompt || getPromptForMode(mode, resumeText, jobDescription);

  try {
    const analysis = await callGemini(prompt, apiKey);
    return { success: true, analysis };
  } catch (error) {
    logger.error("Error in evaluateResume:", error);
    throw new HttpsError("internal", error.message || "Failed to evaluate resume");
  }
});

exports.generateAtsMatch = onCall(async (request) => {
  const { prompt, fileData, fileMimeType, resumeText, jobDescription, mode } = request.data || {};
  const effectivePrompt = prompt || getPromptForMode(mode || "atsMatch", resumeText || "", jobDescription || "");

  if (!effectivePrompt) {
    throw new HttpsError("invalid-argument", "The function must be called with 'prompt' or 'resumeText' and 'jobDescription'.");
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY not configured.");
  }

  try {
    const analysis = await callGemini(effectivePrompt, apiKey);
    return { success: true, analysis, result: JSON.stringify(analysis) };
  } catch (error) {
    logger.error("Error in generateAtsMatch:", error);
    throw new HttpsError("internal", error.message || "An error occurred");
  }
});
