import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, Lightbulb, Key, RefreshCw, Trash2, ArrowUpRight, Upload } from 'lucide-react';

export default function AtsMatcher() {
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Load saved resume and API key from localStorage or environment on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const savedKey = localStorage.getItem('gemini_api_key') || envKey;
    const savedResume = localStorage.getItem('ats_resume_text') || '';
    setApiKey(savedKey);
    setResumeText(savedResume);
    if (!savedKey) {
      setShowKeyInput(true);
    }
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setShowKeyInput(false);
    setError(null);
  };

  const handleSaveResume = (text) => {
    setResumeText(text);
    localStorage.setItem('ats_resume_text', text);
  };

  const handleClearResume = () => {
    if (window.confirm('Are you sure you want to clear your saved resume?')) {
      setResumeText('');
      localStorage.removeItem('ats_resume_text');
    }
  };

  const handleCompare = async () => {
    if (!apiKey.trim()) {
      setError('Please provide a Gemini API key.');
      setShowKeyInput(true);
      return;
    }
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
    setResult(null);

    const prompt = `You are an expert ATS (Applicant Tracking System) parser and optimizer.
Compare the following resume text to the job description text.
Analyze the matching skills, missing critical keywords, and provide recommendations.

Return a JSON response matching this structure exactly:
{
  "match_percentage": <number between 0 and 100>,
  "matching_skills": [<list of skills present in both>],
  "missing_keywords": [<list of important skills/keywords from job description missing in resume>],
  "improvements": [<list of clear action points to make resume match better>]
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error (${response.status})`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('Empty response from Gemini API.');
      }

      const parsedResult = JSON.parse(textResponse);
      setResult(parsedResult);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner & API Key Setup */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.25rem', 
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={22} color="var(--accent-blue)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>ATS Resume Matcher</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Compare your resume to any job application instantly using Gemini AI</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowKeyInput(!showKeyInput)} 
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.85rem', minHeight: '36px', padding: '0.35rem 0.75rem' }}
          >
            <Key size={14} />
            <span>{apiKey ? 'Manage API Key' : 'Setup API Key'}</span>
          </button>
        </div>

        {/* API Key Form */}
        {showKeyInput && (
          <form onSubmit={handleSaveKey} style={{ 
            marginTop: '0.5rem', 
            background: '#f8fafc', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gemini API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="Paste your API key here (AIzaSy...)" 
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ minHeight: '36px', padding: '0.35rem 1rem', fontSize: '0.85rem' }}>
                Save Key
              </button>
              <button 
                type="button" 
                onClick={() => setShowKeyInput(false)} 
                className="btn btn-secondary" 
                style={{ minHeight: '36px', padding: '0.35rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Your key is saved locally in your browser and never sent anywhere else. 
              Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Google AI Studio</a>.
            </p>
          </form>
        )}
      </div>

      {/* Editor Columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1.25rem',
        alignItems: 'stretch'
      }}>
        
        {/* Left Column: Resume Input */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.25rem', 
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--accent-blue)" />
              <strong style={{ fontSize: '1rem', fontWeight: 700 }}>Your Resume</strong>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept=".txt,.pdf" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                id="resume-file-upload" 
              />
              <label 
                htmlFor="resume-file-upload" 
                className="btn btn-secondary btn-sm"
                style={{ 
                  cursor: 'pointer', 
                  fontSize: '0.75rem', 
                  minHeight: '30px', 
                  padding: '0.2rem 0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="spin-animation" size={12} />
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
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--accent-rose)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
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
            style={{
              width: '100%',
              minHeight: '280px',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              resize: 'vertical',
              lineHeight: 1.4,
              flexGrow: 1
            }}
          />
        </div>

        {/* Right Column: Job Description Input */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.25rem', 
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpRight size={18} color="var(--accent-blue)" />
            <strong style={{ fontSize: '1rem', fontWeight: 700 }}>Job Description</strong>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting description here..."
            style={{
              width: '100%',
              minHeight: '280px',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              resize: 'vertical',
              lineHeight: 1.4,
              flexGrow: 1
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <button 
          onClick={handleCompare} 
          disabled={loading}
          className="btn btn-primary"
          style={{ minWidth: '200px', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
          {loading ? (
            <>
              <RefreshCw className="spin-animation" size={18} />
              <span>Analyzing Match...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analyze Match Percentage</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          background: 'rgba(244, 63, 94, 0.05)', 
          border: '1px solid var(--accent-rose)', 
          color: 'var(--accent-rose)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.85rem 1.25rem',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {error}
        </div>
      )}

      {/* Result Panel */}
      {result && (
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          
          {/* Header Score Display */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            borderBottom: '1px solid var(--border-color)', 
            paddingBottom: '1.25rem',
            flexWrap: 'wrap'
          }}>
            {/* Circular score visualizer */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `6px solid ${getScoreColor(result.match_percentage)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: getScoreColor(result.match_percentage),
              background: '#f8fafc'
            }}>
              {result.match_percentage}%
            </div>
            
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ATS Match Score: {result.match_percentage}%</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {result.match_percentage >= 80 
                  ? 'Excellent fit! Your resume contains a high density of target keywords.'
                  : result.match_percentage >= 50
                  ? 'Decent fit, but there are notable keyword gaps you should close before applying.'
                  : 'Low keywords match. Tailor your resume before submitting to avoid ATS filtering.'}
              </p>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.25rem' 
          }}>
            
            {/* Matching Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={18} />
                <strong style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Matching Keywords</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {result.matching_skills?.length > 0 ? (
                  result.matching_skills.map((skill, i) => (
                    <span key={i} className="badge badge-emerald" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matching keywords identified.</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-rose)' }}>
                <AlertTriangle size={18} />
                <strong style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Missing Target Keywords</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {result.missing_keywords?.length > 0 ? (
                  result.missing_keywords.map((kw, i) => (
                    <span key={i} className="badge badge-rose" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      {kw}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>No missing target keywords found! Excellent density.</span>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          {result.improvements?.length > 0 && (
            <div style={{ 
              marginTop: '0.5rem', 
              background: '#f8fafc', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem', color: 'var(--accent-blue)' }}>
                <Lightbulb size={18} />
                <strong style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Actionable Recommendations</strong>
              </div>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: 0 }}>
                {result.improvements.map((imp, i) => (
                  <li key={i} style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.4rem'
                  }}>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
