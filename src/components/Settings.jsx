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
    <div className="flex flex-col gap-5 font-body">
      
      <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
        
        {/* Row 1: Personal Profile */}
        <div className="section-card p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-border-color pb-3">
            <User size={20} color="var(--accent-blue)" />
            <h3 className="text-[1.1rem] font-bold text-text-primary font-heading">Personal Job Seeker Profile</h3>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Ryan Botha" 
                className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-body text-sm min-h-[44px] outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary">Contact Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. ryan@example.com" 
                className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-body text-sm min-h-[44px] outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. +1 (555) 019-2834" 
                className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-body text-sm min-h-[44px] outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary">Target Roles / Job Titles</label>
              <input 
                type="text" 
                value={targetRoles} 
                onChange={(e) => setTargetRoles(e.target.value)} 
                placeholder="e.g. React Developer, Mobile Designer" 
                className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-body text-sm min-h-[44px] outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Professional Pitch / Summary</label>
            <textarea 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              placeholder="Brief summary of your professional experience and core strengths..." 
              className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-body text-sm min-h-[100px] resize-y outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label className="text-[0.85rem] font-semibold text-text-secondary">Master Resume (for ATS Auto-Matching)</label>
              
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".txt,.pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="settings-resume-upload" 
                />
                <label 
                  htmlFor="settings-resume-upload" 
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
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your master resume?')) {
                        setResumeText('');
                      }
                    }}
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
              onChange={(e) => setResumeText(e.target.value)} 
              placeholder="Paste or upload your master resume content here. This resume is matched automatically against all your job applications!" 
              className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-body text-sm min-h-[150px] resize-y outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
            />
            {uploadError && (
              <span className="text-xs text-accent-rose font-medium">
                {uploadError}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: API Keys */}
        <div className="section-card p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-border-color pb-3">
            <Key size={20} color="var(--accent-blue)" />
            <h3 className="text-[1.1rem] font-bold text-text-primary font-heading">API Configuration & Credentials</h3>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Gemini API Key</label>
                {envKeyDetected && (
                  <span className="text-[0.75rem] text-accent-emerald flex items-center gap-1 font-semibold">
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
                className="bg-bg-input border border-border-color rounded-md px-3.5 py-2.5 text-text-primary font-mono text-sm min-h-[44px] outline-none w-full hover:border-accent-blue focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button 
                type="button" 
                onClick={handleTestApiKey} 
                disabled={testingKey}
                className="inline-flex items-center justify-center gap-2 font-body font-semibold text-sm min-h-[36px] px-4 py-1.5 rounded-sm border border-border-color bg-bg-card text-text-primary hover:bg-bg-elevated cursor-pointer transition-all duration-150 active:opacity-85"
              >
                {testingKey ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
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
              <div className={`border rounded-sm py-2.5 px-3.5 text-[0.85rem] font-medium flex items-center gap-1.5 mt-1 ${
                testResult.success
                  ? 'bg-accent-emerald/5 border-accent-emerald text-accent-emerald'
                  : 'bg-accent-rose/5 border-accent-rose text-accent-rose'
              }`}>
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-2 flex-wrap gap-4">
          <button 
            type="button" 
            onClick={handleClearSettings} 
            className="inline-flex items-center justify-center gap-1.5 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-border-color bg-bg-card text-accent-rose hover:bg-bg-elevated cursor-pointer transition-all duration-150 active:opacity-85"
          >
            <Trash2 size={16} />
            <span>Reset All Settings</span>
          </button>

          <div className="flex gap-3 items-center">
            {saveSuccess && (
              <span className="text-[0.85rem] text-accent-emerald font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Settings Saved Successfully!</span>
              </span>
            )}
            
            <button 
              type="submit" 
              className="inline-flex items-center justify-center gap-1.5 font-body font-semibold text-base min-h-[44px] px-5 py-2.5 rounded-md border border-transparent bg-accent-blue text-white hover:bg-[#1d4ed8] cursor-pointer transition-all duration-150 active:opacity-85 min-w-[150px]"
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
