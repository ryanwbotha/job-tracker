import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Save, Trash2, RefreshCw, Upload } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

export default function Settings() {
  // Personal Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [summary, setSummary] = useState('');
  const [resumeText, setResumeText] = useState('');

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
      let extractedText = '';
      if (fileType === 'pdf') {
        extractedText = await parsePdfBrowser(file);
      } else {
        extractedText = await file.text();
      }

      setResumeText(extractedText);
    } catch (err) {
      setUploadError(err.message || 'Failed to read resume file.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setName(localStorage.getItem('jst_user_name') || '');
    setEmail(localStorage.getItem('jst_user_email') || '');
    setPhone(localStorage.getItem('jst_user_phone') || '');
    setTargetRoles(localStorage.getItem('jst_target_roles') || '');
    setSummary(localStorage.getItem('jst_user_summary') || '');
    setResumeText(localStorage.getItem('ats_resume_text') || '');
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();

    localStorage.setItem('jst_user_name', name);
    localStorage.setItem('jst_user_email', email);
    localStorage.setItem('jst_user_phone', phone);
    localStorage.setItem('jst_target_roles', targetRoles);
    localStorage.setItem('jst_user_summary', summary);
    localStorage.setItem('ats_resume_text', resumeText);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearSettings = () => {
    if (!window.confirm('Are you sure you want to clear your saved profile settings?')) return;
    
    localStorage.removeItem('jst_user_name');
    localStorage.removeItem('jst_user_email');
    localStorage.removeItem('jst_user_phone');
    localStorage.removeItem('jst_target_roles');
    localStorage.removeItem('jst_user_summary');
    localStorage.removeItem('ats_resume_text');

    setName('');
    setEmail('');
    setPhone('');
    setTargetRoles('');
    setSummary('');
    setResumeText('');
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
        
        {/* Row 1: Personal Profile */}
        <Card className="p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <User size={20} className="text-primary" />
            <h3 className="text-lg font-bold text-foreground">Personal Job Seeker Profile</h3>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <Input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Jane Doe" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Contact Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. ryan@example.com" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. +1 (555) 019-2834" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Target Roles / Job Titles</label>
              <Input 
                type="text" 
                value={targetRoles} 
                onChange={(e) => setTargetRoles(e.target.value)} 
                placeholder="e.g. React Developer, Mobile Designer" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Professional Pitch / Summary</label>
            <Textarea 
              value={summary} 
              onChange={(e) => setSummary(e.target.value)} 
              placeholder="Brief summary of your professional experience and core strengths..." 
              className="min-h-[100px]"
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Master Resume (for ATS Auto-Matching)</label>
              
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".txt,.pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="settings-resume-upload" 
                />
                <Button variant="outline" size="sm" render={
                  <label htmlFor="settings-resume-upload" className="cursor-pointer gap-1">
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
                } />
                {resumeText && (
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your master resume?')) {
                        setResumeText('');
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>
            
            <Textarea 
              value={resumeText} 
              onChange={(e) => setResumeText(e.target.value)} 
              placeholder="Paste or upload your master resume content here. This resume is matched automatically against all your job applications!" 
              className="min-h-[150px]"
            />
            {uploadError && (
              <span className="text-xs text-destructive font-medium">
                {uploadError}
              </span>
            )}
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-2 flex-wrap gap-4">
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleClearSettings} 
            className="gap-2"
          >
            <Trash2 size={16} />
            <span>Reset All Settings</span>
          </Button>

          <div className="flex gap-3 items-center">
            {saveSuccess && (
              <span className="text-xs text-primary font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Settings Saved Successfully!</span>
              </span>
            )}
            
            <Button 
              type="submit" 
              className="gap-2 min-w-[150px]"
            >
              <Save size={16} />
              <span>Save Profile</span>
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
}
