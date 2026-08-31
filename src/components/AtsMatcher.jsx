import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, Trash2, ArrowUpRight, Upload, X, Award, BookOpen } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

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
      let extractedText = '';
      if (fileType === 'pdf') {
        extractedText = await parsePdfBrowser(file);
      } else {
        extractedText = await file.text();
      }

      handleSaveResume(extractedText);
    } catch (err) {
      setError(err.message || 'Failed to read resume file.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('ats_resume_text');
    if (saved) {
      setResumeText(saved);
    }
  }, []);

  const handleSaveResume = (text) => {
    setResumeText(text);
    localStorage.setItem('ats_resume_text', text);
  };

  const handleClearResume = () => {
    setResumeText('');
    localStorage.removeItem('ats_resume_text');
  };

  const handleCompare = async () => {
    if (!resumeText.trim()) {
      setError('Please paste or upload your resume first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the target job description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calls Cloud Function using the secret GEMINI_API_KEY configured on backend
      const evaluateResume = httpsCallable(functions, 'evaluateResume');
      const res = await evaluateResume({
        resumeText,
        jobDescription,
        mode: activeMode
      });

      if (res.data && res.data.success) {
        setResults(prev => ({
          ...prev,
          [activeMode]: res.data.analysis
        }));
      } else {
        throw new Error(res.data?.error || 'Failed to evaluate resume via Cloud Function.');
      }
    } catch (err) {
      console.error('ATS Evaluation Error:', err);
      setError(err.message || 'Error calling AI service. Please verify Cloud Functions deployment and secret configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Determine progress color class based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--primary)';
    if (score >= 50) return 'var(--primary)';
    return 'var(--destructive)';
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Top Banner */}
      <Card className="p-6 md:p-8 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles size={22} className="text-primary" />
            <div>
              <h3 className="text-[1.1rem] font-bold text-text-primary font-heading">ATS Resume Matcher</h3>
              <p className="text-[0.85rem] text-text-secondary">Compare your resume to any job application instantly using Gemini AI</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mode Selector Tab Bar */}
      <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full mt-2 mb-4">
        <TabsList className="grid grid-cols-3 w-full max-w-[700px] h-10">
          <TabsTrigger value="atsMatch" className="gap-2">
            <Sparkles size={16} />
            <span>ATS Percentage Match</span>
          </TabsTrigger>
          <TabsTrigger value="professionalEvaluation" className="gap-2">
            <FileText size={16} />
            <span>Professional HR Evaluation</span>
          </TabsTrigger>
          <TabsTrigger value="skillsImprovement" className="gap-2">
            <Lightbulb size={16} />
            <span>Skills Coach</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-5 items-stretch">
        
        <Card className="p-6 flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <strong className="text-base font-bold text-foreground">Your Resume</strong>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept=".txt,.pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
                id="resume-file-upload" 
              />
              <Button variant="outline" size="sm">
                <label htmlFor="resume-file-upload" className="cursor-pointer flex items-center gap-1">
                  {isUploading ? (
                    <>
                      <RefreshCw className="animate-spin" size={12} />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      <span>Upload</span>
                    </>
                  )}
                </label>
              </Button>

              {resumeText && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResume} 
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
            onChange={(e) => handleSaveResume(e.target.value)}
            placeholder="Paste your plain text resume content here... It will save automatically."
            className="min-h-[280px] flex-grow"
          />
        </Card>

        <Card className="p-6 flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} className="text-primary" />
            <strong className="text-base font-bold text-foreground">Job Description</strong>
          </div>

          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting description here..."
            className="min-h-[280px] flex-grow"
          />
        </Card>
      </div>

      <div className="flex justify-center gap-3 mt-2 flex-wrap">
        <Button 
          onClick={handleCompare} 
          disabled={loading}
          className="min-w-[260px] gap-2"
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
        </Button>

        {(results.atsMatch || results.professionalEvaluation || results.skillsImprovement) && (
          <Button 
            variant="outline"
            onClick={() => {
              setResults({
                atsMatch: null,
                professionalEvaluation: null,
                skillsImprovement: null
              });
              setJobDescription('');
            }}
            className="gap-2"
          >
            <Trash2 size={18} />
            <span>Clear Job & Results</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md py-3.5 px-5 text-sm font-medium">
          {error}
        </div>
      )}

      {activeMode === 'atsMatch' && results.atsMatch && (
        <Card className="p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-6 border-b border-border pb-5 flex-wrap">
            <div 
              onClick={() => setShowBreakdownModal(true)}
              className="w-20 h-20 rounded-full border-[6px] flex items-center justify-center text-2xl font-extrabold bg-muted cursor-pointer transition-transform hover:scale-105"
              style={{ borderColor: getScoreColor(results.atsMatch.match_percentage), color: getScoreColor(results.atsMatch.match_percentage) }}
              title="Click to view details breakdown"
            >
              {results.atsMatch.match_percentage}%
            </div>
            
            <div 
              onClick={() => setShowBreakdownModal(true)} 
              className="cursor-pointer flex-1 min-w-[200px] transition-opacity hover:opacity-85"
              title="Click to view details breakdown"
            >
              <h4 className="text-xl font-extrabold flex items-center gap-2 flex-wrap text-foreground">
                <span>ATS Match Score: {results.atsMatch.match_percentage}%</span>
                <Badge variant="secondary" className="cursor-pointer">
                  View Details Breakdown ↗
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {results.atsMatch.match_percentage >= 80 
                  ? 'Excellent fit! Your resume contains a high density of target keywords.'
                  : results.atsMatch.match_percentage >= 50
                  ? 'Decent fit, but there are notable keyword gaps you should close before applying.'
                  : 'Low keywords match. Tailor your resume before submitting to avoid ATS filtering.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 size={18} />
                <strong className="text-sm font-bold text-foreground">Matching Keywords</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.atsMatch.matching_skills?.length > 0 ? (
                  results.atsMatch.matching_skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No matching keywords identified.</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle size={18} />
                <strong className="text-sm font-bold text-foreground">Missing Target Keywords</strong>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.atsMatch.missing_keywords?.length > 0 ? (
                  results.atsMatch.missing_keywords.map((kw, i) => (
                    <Badge key={i} variant="destructive">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-primary font-semibold">No missing target keywords found! Excellent density.</span>
                )}
              </div>
            </div>
          </div>

          {results.atsMatch.profile_summary && (
            <div className="mt-2 bg-muted/30 border border-border rounded-md p-4">
              <div className="flex items-center gap-1.5 mb-2 text-primary font-bold text-sm">
                <Sparkles size={18} />
                <strong className="text-foreground">ATS Profile Summary</strong>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {results.atsMatch.profile_summary}
              </p>
            </div>
          )}
        </Card>
      )}

      {activeMode === 'professionalEvaluation' && results.professionalEvaluation && (
        <Card className="p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-6 border-b border-border pb-5 flex-wrap">
            <div 
              className="w-20 h-20 rounded-full border-[6px] flex items-center justify-center text-2xl font-extrabold bg-muted"
              style={{ borderColor: getScoreColor(results.professionalEvaluation.alignment_score), color: getScoreColor(results.professionalEvaluation.alignment_score) }}
            >
              {results.professionalEvaluation.alignment_score}%
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-xl font-extrabold text-foreground">
                HR Alignment Review
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {results.professionalEvaluation.alignment_score >= 80 
                  ? 'Strong alignment! Your professional background closely fits this technical role.'
                  : results.professionalEvaluation.alignment_score >= 50
                  ? 'Moderate alignment, some experience gaps or missing details to address.'
                  : 'Weak alignment, significant skill or role level disconnect.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-primary">
                <CheckCircle2 size={18} />
                <strong className="text-sm font-bold text-foreground">Candidate Strengths</strong>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground pl-4 list-disc">
                {results.professionalEvaluation.strengths?.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle size={18} />
                <strong className="text-sm font-bold text-foreground">Alignment Gaps & Weaknesses</strong>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground pl-4 list-disc">
                {results.professionalEvaluation.weaknesses?.map((wk, i) => (
                  <li key={i}>{wk}</li>
                ))}
              </ul>
            </div>
          </div>

          {results.professionalEvaluation.evaluation_summary && (
            <div className="mt-2 bg-muted/30 border border-border rounded-md p-4">
              <div className="flex items-center gap-1.5 mb-2 text-primary font-bold text-sm">
                <Award size={18} />
                <strong className="text-foreground">HR Evaluation Summary</strong>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {results.professionalEvaluation.evaluation_summary}
              </p>
            </div>
          )}
        </Card>
      )}

      {activeMode === 'skillsImprovement' && results.skillsImprovement && (
        <Card className="p-6 md:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <BookOpen size={22} className="text-primary" />
            <div>
              <h4 className="text-lg font-bold text-foreground">Skills Coach Recommendations</h4>
              <p className="text-xs text-muted-foreground">Actionable advice to level up your resume for this position</p>
            </div>
          </div>

          <div className="grid grid-cols-2 max-[768px]:grid-cols-1 gap-5">
            <div className="flex flex-col gap-3">
              <strong className="text-sm font-bold text-foreground">Priority Skills to Learn / Add</strong>
              <div className="flex flex-wrap gap-1.5">
                {results.skillsImprovement.priority_skills_to_add?.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <strong className="text-sm font-bold text-foreground">Recommended Certifications & Courses</strong>
              <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground pl-4 list-disc">
                {results.skillsImprovement.certifications_recommendations?.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>

          {results.skillsImprovement.general_advice && (
            <div className="mt-2 bg-muted/30 border border-border rounded-md p-4">
              <div className="flex items-center gap-1.5 mb-2 text-primary font-bold text-sm">
                <Lightbulb size={18} />
                <strong className="text-foreground">Career Coaching Advice</strong>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {results.skillsImprovement.general_advice}
              </p>
            </div>
          )}
        </Card>
      )}

      <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              <span>ATS Match Details Breakdown</span>
            </DialogTitle>
          </DialogHeader>

          {results.atsMatch && (
            <div className="flex flex-col gap-5 mt-2">
              <div className="bg-muted/40 border border-border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">Overall Match Quality</div>
                  <div className="text-base font-extrabold" style={{ color: getScoreColor(results.atsMatch.match_percentage) }}>
                    {results.atsMatch.match_percentage >= 80 
                      ? 'High Match (Good to Go!)'
                      : results.atsMatch.match_percentage >= 50
                      ? 'Moderate Match (Needs Tweaks)'
                      : 'Low Match (Needs Focus)'}
                  </div>
                </div>
                <div className="text-3xl font-black" style={{ color: getScoreColor(results.atsMatch.match_percentage) }}>
                  {results.atsMatch.match_percentage}%
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-primary">
                    <CheckCircle2 size={18} />
                    <strong className="text-sm font-bold text-foreground">Matched Points ({results.atsMatch.matching_skills?.length || 0})</strong>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These skills or keywords are successfully aligned between your resume and the job description:
                  </p>
                  <div className="flex flex-wrap gap-1.5 bg-primary/10 border border-primary/20 rounded-md p-3">
                    {results.atsMatch.matching_skills?.length > 0 ? (
                      results.atsMatch.matching_skills.map((skill, i) => (
                        <Badge key={i} variant="default">{skill}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No matching keywords identified.</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-destructive">
                    <AlertTriangle size={18} />
                    <strong className="text-sm font-bold text-foreground">Unmatched Points ({results.atsMatch.missing_keywords?.length || 0})</strong>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These are key requirements from the job description that were not found in your resume:
                  </p>
                  <div className="flex flex-wrap gap-1.5 bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    {results.atsMatch.missing_keywords?.length > 0 ? (
                      results.atsMatch.missing_keywords.map((kw, i) => (
                        <Badge key={i} variant="destructive">{kw}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-primary font-semibold">No missing target keywords found! Excellent density.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBreakdownModal(false)}>Close Breakdown</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
