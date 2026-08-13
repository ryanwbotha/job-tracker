import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, Trash2, ArrowUpRight, Upload, X, Award, BookOpen } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export default function AtsMatcher() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMode, setActiveMode] = useState('atsMatch'); // 'atsMatch' | 'professionalEvaluation' | 'skillsImprovement'
  const [results, setResults] = useState({
    atsMatch: null,
    professionalEvaluation: null,
    skillsImprovement: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Helper to dynamically load PDF.js and extract text from files in the browser
  const parsePdfBrowser = async (file) => {
    let pdfjs = window.pdfjsLib;
    if (!pdfjs) {
      pdfjs = await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        };
        script.onerror = () => reject(new Error('Failed to load PDF parsing library.'));
        document.head.appendChild(script);
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PDF.');
    }
    
    return fullText;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const fileType = file.name.split('.').pop().toLowerCase();
    
    try {
      if (fileType === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleSaveResume(event.target.result);
          setIsUploading(false);
        };
        reader.readAsText(file);
      } else if (fileType === 'pdf') {
        const text = await parsePdfBrowser(file);
        handleSaveResume(text);
        setIsUploading(false);
      } else {
        throw new Error('Unsupported file format. Please upload a .txt or .pdf file.');
      }
    } catch (err) {
      console.error(err);
      setError(`File upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  // Load saved resume from localStorage on mount
  useEffect(() => {
    const savedResume = localStorage.getItem('ats_resume_text') || '';
    setResumeText(savedResume);
  }, []);

  const handleSaveResume = (text) => {
    setResumeText(text);
    localStorage.setItem('ats_resume_text', text);
    setResults({
      atsMatch: null,
      professionalEvaluation: null,
      skillsImprovement: null
    });
  };

  const handleClearResume = () => {
    if (window.confirm('Are you sure you want to clear your saved resume?')) {
      setResumeText('');
      localStorage.removeItem('ats_resume_text');
      setResults({
        atsMatch: null,
        professionalEvaluation: null,
        skillsImprovement: null
      });
    }
  };

  const handleCompare = async () => {
    if (!resumeText.trim()) {
      setError('Please enter or paste your resume text first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the job description.');
      return;
    }

    setLoading(true);
    setError(null);

    let prompt = '';
    if (activeMode === 'atsMatch') {
      prompt = `You are a skilled and very experienced ATS (Application Tracking System) parser and optimizer with a deep understanding of the tech field, software engineering, data science, data analyst, and big data engineer. Your task is to evaluate the resume based on the given job description.
You must consider the job market is very competitive and you should provide the best assistance for improving the resumes.
Assign the percentage matching based on the job description and the missing keywords with high accuracy.

Return a JSON response matching this structure exactly:
{
  "match_percentage": <number between 0 and 100>,
  "matching_skills": [<list of technical skills present in both>],
  "missing_keywords": [<list of important technical skills/keywords from job description missing in resume>],
  "profile_summary": "<brief professional analysis of the candidate's strengths and weaknesses in 3-4 sentences>"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;
    } else if (activeMode === 'professionalEvaluation') {
      prompt = `You are an experienced Technical Human Resource Manager specializing in the tech field, software engineering, data science, data analyst, and big data engineer roles. Your task is to review the provided resume against the job description.
Please share your professional evaluation on whether the candidate's profile aligns with the role. Highlight the strengths and weaknesses of the applicant against the specified job requirements.

Return a JSON response matching this structure exactly:
{
  "alignment_score": <number between 0 and 100>,
  "strengths": [<list of candidate's key strengths for this role>],
  "weaknesses": [<list of candidate's key weaknesses or alignment gaps for this role>],
  "evaluation_summary": "<detailed HR evaluation statement, about 4-6 sentences, highlighting candidate's overall suitability>"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;
    } else if (activeMode === 'skillsImprovement') {
      prompt = `You are an experienced Technical Recruiter and Career Coach specializing in the tech field, software engineering, data science, data analyst, and big data engineer roles. Your task is to review the provided resume against the job description.
Please share your professional evaluation on how the candidate can improve their skills. Highlight the specific areas of improvement and provide concrete, actionable recommendations on how to acquire these skills or represent them better.

Return a JSON response matching this structure exactly:
{
  "priority_skills_to_add": [<list of key technical skills/tools the candidate lacks from the JD>],
  "certifications_recommendations": [<list of recommended certifications, courses, or study areas>],
  "bullet_point_improvements": [
    {
      "original": "<original text or concept from resume to improve>",
      "improved": "<improved version incorporating keywords, action verbs, or impact metrics>"
    }
  ],
  "general_advice": "<general career coaching advice for landing this role, about 3-4 sentences>"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;
    }

    try {
      const generateAtsMatch = httpsCallable(functions, 'generateAtsMatch');
      const response = await generateAtsMatch({ prompt });
      const textResponse = response.data.result;

      if (!textResponse) {
        throw new Error('Empty response from Gemini API.');
      }

      const parsedResult = JSON.parse(textResponse);
      setResults(prev => ({
        ...prev,
        [activeMode]: parsedResult
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during comparison.');
    } finally {
      setLoading(false);
    }
  };

  // Determine progress color class based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Top Banner & API Key Setup */}
      <div className="section-card p-6 md:p-8 flex flex-col gap-3 font-body">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles size={22} color="var(--accent-blue)" />
            <div>
              <h3 className="text-[1.1rem] font-bold text-text-primary font-heading">ATS Resume Matcher</h3>
              <p className="text-[0.85rem] text-text-secondary">Compare your resume to any job application instantly using Gemini AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Tab Bar */}
      <div className="flex border-b-2 border-border-color pb-1 gap-6 mt-2 mb-4 font-body">
        <button
          onClick={() => setActiveMode('atsMatch')}
          className={`bg-transparent border-none pb-2 text-[0.95rem] cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
            activeMode === 'atsMatch'
              ? 'border-b-[3px] border-accent-blue text-accent-blue font-bold'
              : 'border-b-[3px] border-transparent text-text-secondary font-medium'
          }`}
        >
          <Sparkles size={16} />
          <span>ATS Percentage Match</span>
        </button>
        
        <button
          onClick={() => setActiveMode('professionalEvaluation')}
          className={`bg-transparent border-none pb-2 text-[0.95rem] cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
            activeMode === 'professionalEvaluation'
              ? 'border-b-[3px] border-accent-blue text-accent-blue font-bold'
              : 'border-b-[3px] border-transparent text-text-secondary font-medium'
          }`}
        >
          <FileText size={16} />
          <span>Professional HR Evaluation</span>
        </button>
        
        <button
          onClick={() => setActiveMode('skillsImprovement')}
          className={`bg-transparent border-none pb-2 text-[0.95rem] cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
            activeMode === 'skillsImprovement'
              ? 'border-b-[3px] border-accent-blue text-accent-blue font-bold'
              : 'border-b-[3px] border-transparent text-text-secondary font-medium'
          }`}
        >
          <Lightbulb size={16} />
          <span>Skills Coach Recommendations</span>
        </button>
      </div>

      {/* Editor Columns */}
      <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-5 items-stretch">
        
        {/* Left Column: Resume Input */}
        <div className="section-card p-6 flex flex-col gap-3.5 font-body">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText size={18} color="var(--accent-blue)" />
              <strong className="text-base font-bold text-text-primary font-heading">Your Resume</strong>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept=".txt,.pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="resume-file-upload" 
              />
              <label 
                htmlFor="resume-file-upload" 
                className="inline-flex items-center justify-center gap-1 font-body font-semibold text-xs min-h-[30px] px-2.5 py-1 rounded-sm border border-border-color bg-bg-card text-text-primary hover:bg-bg-elevated cursor-pointer transition-all duration-150 active:opacity-85"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    <span>Upload (.txt, .pdf)</span>
                  </>
                )}
              </label>

              {resumeText && (
                <button 
                  onClick={handleClearResume} 
                  className="bg-none border-none text-accent-rose cursor-pointer flex items-center gap-1 text-xs font-semibold"
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => handleSaveResume(e.target.value)}
            placeholder="Paste your plain text resume content here... It will save automatically."
            className="w-full min-h-[280px] p-3.5 rounded-md border border-border-color font-body text-sm resize-y leading-normal flex-grow hover:border-[#cbd5e1] focus:border-border-focus focus:outline-2 focus:outline-border-focus focus:outline-offset-[1px]"
          />
        </div>

        {/* Right Column: Job Description Input */}
        <div className="section-card p-6 flex flex-col gap-3.5 font-body">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} color="var(--accent-blue)" />
            <strong className="text-base font-bold text-text-primary font-heading">Job Description</strong>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting description here..."
            className="w-full min-h-[280px] p-3.5 rounded-md border border-border-color font-body text-sm resize-y leading-normal flex-grow hover:border-[#cbd5e1] focus:border-border-focus focus:outline-2 focus:outline-border-focus focus:outline-offset-[1px]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 mt-2 flex-wrap">
        <button 
          onClick={handleCompare} 
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-transparent bg-accent-blue text-white hover:bg-[#1d4ed8] cursor-pointer transition-all duration-150 active:opacity-85 min-w-[260px]"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>
                {activeMode === 'atsMatch' && 'Run ATS Percentage Match'}
                {activeMode === 'professionalEvaluation' && 'Run HR Evaluation'}
                {activeMode === 'skillsImprovement' && 'Run Skills Coach'}
              </span>
            </>
          )}
        </button>

        {(results.atsMatch || results.professionalEvaluation || results.skillsImprovement) && (
          <button 
            onClick={() => {
              setResults({
                atsMatch: null,
                professionalEvaluation: null,
                skillsImprovement: null
              });
              setJobDescription('');
            }}
            className="inline-flex items-center justify-center gap-2 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-border-color bg-bg-card text-text-primary hover:bg-bg-elevated cursor-pointer transition-all duration-150 active:opacity-85"
          >
            <Trash2 size={18} />
            <span>Clear Job & Results</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-accent-rose/5 border border-accent-rose text-accent-rose rounded-md py-3.5 px-5 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Result Panel - ATS Match */}
      {activeMode === 'atsMatch' && results.atsMatch && (
        <div className="section-card p-6 md:p-8 flex flex-col gap-5 font-body">
          
          {/* Header Score Display */}
          <div className="flex items-center gap-6 border-b border-border-color pb-5 flex-wrap">
            {/* Circular score visualizer */}
            <div 
              onClick={() => setShowBreakdownModal(true)}
              className="w-20 h-20 rounded-full border-[6px] flex items-center justify-center text-2xl font-extrabold bg-[#f8fafc] cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-subtle"
              style={{ borderColor: getScoreColor(results.atsMatch.match_percentage), color: getScoreColor(results.atsMatch.match_percentage) }}
              title="Click to view details breakdown"
            >
              {results.atsMatch.match_percentage}%
            </div>
            
            <div 
              onClick={() => setShowBreakdownModal(true)} 
              className="cursor-pointer flex-1 min-w-[200px] transition-opacity duration-200 hover:opacity-85"
              title="Click to view details breakdown"
            >
              <h4 className="text-xl font-extrabold flex items-center gap-2 flex-wrap font-heading">
                <span>ATS Match Score: {results.atsMatch.match_percentage}%</span>
                <span className="text-xs text-accent-blue font-semibold bg-accent-blue/8 px-2 py-0.5 rounded-sm border border-accent-blue/15">
                  View Details Breakdown ↗
                </span>
              </h4>
              <p className="text-[0.85rem] text-text-secondary mt-1">
                {results.atsMatch.match_percentage >= 80 
                  ? 'Excellent fit! Your resume contains a high density of target keywords.'
                  : results.atsMatch.match_percentage >= 50
                  ? 'Decent fit, but there are notable keyword gaps you should close before applying.'
                  : 'Low keywords match. Tailor your resume before submitting to avoid ATS filtering.'}
              </p>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-5">
            
            {/* Matching Skills */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-emerald font-heading">
                <CheckCircle2 size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Matching Keywords</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.atsMatch.matching_skills?.length > 0 ? (
                  results.atsMatch.matching_skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold leading-normal border-none bg-accent-emerald/8 text-accent-emerald">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[0.85rem] text-text-muted font-body">No matching keywords identified.</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-rose font-heading">
                <AlertTriangle size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Missing Target Keywords</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.atsMatch.missing_keywords?.length > 0 ? (
                  results.atsMatch.missing_keywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold leading-normal border-none bg-accent-rose/8 text-[#e11d48]">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-[0.85rem] text-accent-emerald font-semibold font-body">No missing target keywords found! Excellent density.</span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Summary List */}
          {results.atsMatch.profile_summary && (
            <div className="mt-2 bg-[#f8fafc] border border-border-color rounded-md p-4">
              <div className="flex items-center gap-1.5 mb-2.5 text-accent-blue font-bold text-[0.95rem] font-heading">
                <Sparkles size={18} />
                <strong className="text-text-primary">ATS Profile Summary</strong>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed m-0">
                {results.atsMatch.profile_summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Result Panel - HR Evaluation */}
      {activeMode === 'professionalEvaluation' && results.professionalEvaluation && (
        <div className="section-card p-6 md:p-8 flex flex-col gap-5 font-body">
          
          {/* Header Score Display */}
          <div className="flex items-center gap-6 border-b border-border-color pb-5 flex-wrap">
            {/* Circular score visualizer */}
            <div 
              className="w-20 h-20 rounded-full border-[6px] flex items-center justify-center text-2xl font-extrabold bg-[#f8fafc]"
              style={{ borderColor: getScoreColor(results.professionalEvaluation.alignment_score), color: getScoreColor(results.professionalEvaluation.alignment_score) }}
            >
              {results.professionalEvaluation.alignment_score}%
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-xl font-extrabold font-heading text-text-primary">
                HR Alignment Review
              </h4>
              <p className="text-[0.85rem] text-text-secondary mt-1">
                {results.professionalEvaluation.alignment_score >= 80 
                  ? 'Strong alignment! Your professional background closely fits this technical role.'
                  : results.professionalEvaluation.alignment_score >= 50
                  ? 'Moderate alignment, some experience gaps or missing details to address.'
                  : 'Weak alignment, significant skill or role level disconnect.'}
              </p>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-5">
            
            {/* Strengths */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-emerald font-heading">
                <CheckCircle2 size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Key Strengths</strong>
              </div>
              <ul className="list-none flex flex-col gap-2 pl-0">
                {results.professionalEvaluation.strengths?.map((strength, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-text-secondary font-body">
                    <span className="text-accent-emerald font-bold">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-rose font-heading">
                <AlertTriangle size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Alignment Gaps / Weaknesses</strong>
              </div>
              <ul className="list-none flex flex-col gap-2 pl-0">
                {results.professionalEvaluation.weaknesses?.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-text-secondary font-body">
                    <span className="text-accent-rose font-bold">⚠</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* HR Evaluation Summary */}
          {results.professionalEvaluation.evaluation_summary && (
            <div className="mt-2 bg-[#f8fafc] border border-border-color rounded-md p-4">
              <div className="flex items-center gap-1.5 mb-2.5 text-accent-blue font-bold text-[0.95rem] font-heading">
                <FileText size={18} />
                <strong className="text-text-primary">Professional HR Statement</strong>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed m-0 italic">
                "{results.professionalEvaluation.evaluation_summary}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Result Panel - Skills Improvement */}
      {activeMode === 'skillsImprovement' && results.skillsImprovement && (
        <div className="section-card p-6 md:p-8 flex flex-col gap-5 font-body">
          
          <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-5">
            {/* Priority Skills to Add */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-blue font-heading">
                <Sparkles size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Priority Skills to Add</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.skillsImprovement.priority_skills_to_add?.length > 0 ? (
                  results.skillsImprovement.priority_skills_to_add.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold leading-normal border border-accent-blue/15 bg-accent-blue/8 text-accent-blue font-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[0.85rem] text-text-muted font-body">No high-priority missing skills detected.</span>
                )}
              </div>
            </div>

            {/* Certifications Recommendations */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-blue font-heading">
                <Award size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Recommended Certifications / Training</strong>
              </div>
              <ul className="list-none flex flex-col gap-2 pl-0">
                {results.skillsImprovement.certifications_recommendations?.map((cert, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-sm text-text-secondary font-body">
                    <span className="text-accent-blue font-bold">•</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bullet Point Improvements */}
          {results.skillsImprovement.bullet_point_improvements?.length > 0 && (
            <div className="mt-2 bg-[#f8fafc] border border-border-color rounded-md p-5 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-accent-amber font-heading mb-1">
                <Lightbulb size={18} />
                <strong className="text-[0.95rem] font-bold text-text-primary">Suggested Resume Bullet Point Refinements</strong>
              </div>
              <div className="flex flex-col gap-4">
                {results.skillsImprovement.bullet_point_improvements.map((item, i) => (
                  <div key={i} className={`grid grid-cols-2 max-[600px]:grid-cols-1 gap-4 ${
                    i < results.skillsImprovement.bullet_point_improvements.length - 1 ? 'border-b border-border-color pb-4' : ''
                  }`}>
                    <div className="bg-[#fffbeb] border border-[#fef3c7] p-3 rounded-sm">
                      <div className="text-[0.725rem] font-bold text-accent-amber mb-1">ORIGINAL CONCEPT:</div>
                      <div className="text-sm text-text-secondary leading-relaxed italic">"{item.original}"</div>
                    </div>
                    <div className="bg-[#ecfdf5] border border-[#d1fae5] p-3 rounded-sm">
                      <div className="text-[0.725rem] font-bold text-accent-emerald mb-1">ATS-OPTIMIZED REWRITE:</div>
                      <div className="text-sm text-text-secondary leading-relaxed font-medium">"{item.improved}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Coach Advice */}
          {results.skillsImprovement.general_advice && (
            <div className="mt-2 bg-[#f8fafc] border border-border-color rounded-md p-4">
              <div className="flex items-center gap-1.5 mb-2.5 text-accent-blue font-bold text-[0.95rem] font-heading">
                <BookOpen size={18} />
                <strong className="text-text-primary">Career Coaching Advice</strong>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed m-0">
                {results.skillsImprovement.general_advice}
              </p>
            </div>
          )}
        </div>
      )}

      {showBreakdownModal && results.atsMatch && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-5" onClick={() => setShowBreakdownModal(false)}>
          <div className="bg-bg-card border border-border-color rounded-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-4.5 max-w-[600px] w-90%" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles color="var(--accent-blue)" size={22} />
                <h2 className="text-[1.2rem] font-bold text-text-primary font-heading">ATS Match Details Breakdown</h2>
              </div>
              <button className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm hover:bg-[#f1f5f9] hover:text-text-primary" onClick={() => setShowBreakdownModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-5 mt-2 font-body">
              {/* Score summary */}
              <div className="bg-[#f8fafc] border border-border-color rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-text-secondary font-semibold">Overall Match Quality</div>
                  <div className="text-[1.1rem] font-extrabold" style={{ color: getScoreColor(results.atsMatch.match_percentage) }}>
                    {results.atsMatch.match_percentage >= 80 
                      ? 'High Match (Good to Go!)'
                      : results.atsMatch.match_percentage >= 50
                      ? 'Moderate Match (Needs Tweaks)'
                      : 'Low Match (Needs Focus)'}
                  </div>
                </div>
                <div className="text-[2rem] font-black" style={{ color: getScoreColor(results.atsMatch.match_percentage) }}>
                  {results.atsMatch.match_percentage}%
                </div>
              </div>

              {/* Flex columns for matching and unmatched points */}
              <div className="flex flex-col gap-5">
                {/* Matching Points */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-accent-emerald">
                    <CheckCircle2 size={18} />
                    <strong className="text-[0.95rem] font-bold text-text-primary font-heading">Matched Points ({results.atsMatch.matching_skills?.length || 0})</strong>
                  </div>
                  <p className="text-xs text-text-secondary">
                    These skills or keywords are successfully aligned between your resume and the job description:
                  </p>
                  <div className="flex flex-wrap gap-1.5 bg-[#fafdfb] border border-[#e6f6ec] rounded-md p-3">
                    {results.atsMatch.matching_skills?.length > 0 ? (
                      results.atsMatch.matching_skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold leading-normal border-none bg-accent-emerald/8 text-accent-emerald">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[0.85rem] text-text-muted">No matching keywords identified.</span>
                    )}
                  </div>
                </div>

                {/* Unmatched / Missing Points */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-accent-rose">
                    <AlertTriangle size={18} />
                    <strong className="text-[0.95rem] font-bold text-text-primary font-heading">Unmatched Points ({results.atsMatch.missing_keywords?.length || 0})</strong>
                  </div>
                  <p className="text-xs text-text-secondary">
                    These are key requirements from the job description that were not found in your resume:
                  </p>
                  <div className="flex flex-wrap gap-1.5 bg-[#fffbfa] border border-[#fdeee9] rounded-md p-3">
                    {results.atsMatch.missing_keywords?.length > 0 ? (
                      results.atsMatch.missing_keywords.map((kw, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold leading-normal border-none bg-accent-rose/8 text-[#e11d48]">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[0.85rem] text-accent-emerald font-semibold">No missing target keywords found! Excellent density.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5 border-t border-border-color pt-3">
              <button className="inline-flex items-center justify-center gap-1.5 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-border-color bg-bg-card text-text-primary hover:bg-bg-elevated cursor-pointer transition-all duration-150 active:opacity-85" onClick={() => setShowBreakdownModal(false)}>Close Breakdown</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
