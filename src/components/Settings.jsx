import React, { useState, useEffect } from 'react';
import { User, Key, CheckCircle2, AlertCircle, Save, Trash2, ShieldCheck, Sparkles, RefreshCw, Upload } from 'lucide-react';

export default function Settings() {
  // Personal Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [summary, setSummary] = useState('');
  const [resumeText, setResumeText] = useState('');

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [envKeyDetected, setEnvKeyDetected] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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
    setUploadError(null);

    const fileType = file.name.split('.').pop().toLowerCase();
    
    try {
      if (fileType === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setResumeText(event.target.result);
          setIsUploading(false);
        };
        reader.readAsText(file);
      } else if (fileType === 'pdf') {
        const text = await parsePdfBrowser(file);
        setResumeText(text);
        setIsUploading(false);
      } else {
        throw new Error('Unsupported file format. Please upload a .txt or .pdf file.');
      }
    } catch (err) {
      console.error(err);
      setUploadError(`File upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    setName(localStorage.getItem('settings_name') || '');
    setEmail(localStorage.getItem('settings_email') || '');
    setPhone(localStorage.getItem('settings_phone') || '');
    setTargetRoles(localStorage.getItem('settings_target_roles') || '');
    setSummary(localStorage.getItem('settings_professional_summary') || '');
    setResumeText(localStorage.getItem('ats_resume_text') || '');

    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (envKey) {
      setEnvKeyDetected(true);
    }
    setApiKey(localStorage.getItem('gemini_api_key') || envKey);
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('settings_name', name.trim());
    localStorage.setItem('settings_email', email.trim());
    localStorage.setItem('settings_phone', phone.trim());
    localStorage.setItem('settings_target_roles', targetRoles.trim());
    localStorage.setItem('settings_professional_summary', summary.trim());
    localStorage.setItem('ats_resume_text', resumeText.trim());

    // Only save API key to local storage if it differs from the environment key
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (apiKey.trim() && apiKey.trim() !== envKey) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else if (!apiKey.trim() || apiKey.trim() === envKey) {
      localStorage.removeItem('gemini_api_key');
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearSettings = () => {
    if (window.confirm('Are you sure you want to delete all personal settings?')) {
      setName('');
      setEmail('');
      setPhone('');
      setTargetRoles('');
      setSummary('');
      setResumeText('');
      setApiKey(import.meta.env.VITE_GEMINI_API_KEY || '');
      localStorage.removeItem('settings_name');
      localStorage.removeItem('settings_email');
      localStorage.removeItem('settings_phone');
      localStorage.removeItem('settings_target_roles');
      localStorage.removeItem('settings_professional_summary');
      localStorage.removeItem('ats_resume_text');
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API Key first.' });
      return;
    }

    setTestingKey(true);
    setTestResult(null);

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
              parts: [{ text: 'Hello' }]
            }]
          })
        }
      );

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful! Your Gemini API key is valid.' });
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || `HTTP Error ${response.status}`);
      }
    } catch (err) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setTestingKey(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Row 1: Personal Profile */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personal Job Seeker Profile</h3>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Ryan Botha" 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. ryan@example.com" 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. +1 (555) 019-2834" 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Roles / Job Titles</label>
              <input 
                type="text" 
                value={targetRoles} 
                onChange={(e) => setTargetRoles(e.target.value)} 
                placeholder="e.g. React Developer, Mobile Designer" 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Professional Pitch / Summary</label>
            <textarea 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              placeholder="Brief summary of your professional experience and core strengths..." 
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                width: '100%',
                minHeight: '100px',
                resize: 'vertical',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Master Resume (for ATS Auto-Matching)</label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="file" 
                  accept=".txt,.pdf" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  id="settings-resume-upload" 
                />
                <label 
                  htmlFor="settings-resume-upload" 
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
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your master resume?')) {
                        setResumeText('');
                      }
                    }}
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
              onChange={(e) => setResumeText(e.target.value)} 
              placeholder="Paste or upload your master resume content here. This resume is matched automatically against all your job applications!" 
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                width: '100%',
                minHeight: '150px',
                resize: 'vertical',
                fontFamily: 'var(--font-body)'
              }}
            />
            {uploadError && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', fontWeight: 500 }}>
                {uploadError}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: API Keys */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Key size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>API Configuration & Credentials</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gemini API Key</label>
                {envKeyDetected && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--accent-emerald)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.2rem',
                    fontWeight: 600 
                  }}>
                    <ShieldCheck size={12} />
                    <span>Loaded from environment (.env.local)</span>
                  </span>
                )}
              </div>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="Paste key to override configuration (AIzaSy...)" 
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={handleTestApiKey} 
                disabled={testingKey}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.85rem', minHeight: '36px', padding: '0.35rem 1rem' }}
              >
                {testingKey ? (
                  <>
                    <RefreshCw className="spin-animation" size={14} />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Test API Key Connection</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div style={{ 
                background: testResult.success ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', 
                border: `1px solid ${testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`, 
                color: testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.25rem'
              }}>
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={handleClearSettings} 
            className="btn btn-secondary"
            style={{ color: 'var(--accent-rose)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
          >
            <Trash2 size={16} />
            <span>Reset All Settings</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {saveSuccess && (
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={16} />
                <span>Settings Saved Successfully!</span>
              </span>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', minWidth: '150px' }}
            >
              <Save size={16} />
              <span>Save Profile</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
