const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.generateAtsMatch = onCall(async (request) => {
  // Check if user is authenticated (optional, but good for security)
  // if (!request.auth) {
  //   throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  // }

  const { prompt, fileData, fileMimeType } = request.data;

  if (!prompt) {
    throw new HttpsError("invalid-argument", "The function must be called with one arguments 'prompt' containing the text to send.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("GEMINI_API_KEY environment variable not set.");
    throw new HttpsError("invalid-argument", "GEMINI_API_KEY environment variable not set.");
  }

  try {
    const parts = [];
    if (fileData && fileMimeType) {
      // Extract just the base64 content, in case it includes a Data URL prefix
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      parts.push({
        inline_data: {
          mime_type: fileMimeType,
          data: base64Data
        }
      });
    }
    
    parts.push({ text: prompt });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts,
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error("Gemini API Error", errorData);
      throw new HttpsError("invalid-argument", errorData.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new HttpsError("invalid-argument", "Empty response from Gemini API.");
    }

    return { result: textResponse };
  } catch (error) {
    logger.error("Error calling Gemini API:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("invalid-argument", "Caught error: " + (error.message || "An error occurred"));
  }
});
