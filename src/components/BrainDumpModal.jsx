import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { VoiceNoteRecorder } from '../utils/speechRecognizer';
import { parseBrainDumpText } from '../utils/brainDumpParser';
import { 
  Microphone, 
  MicrophoneSlash, 
  Sparkle, 
  Check, 
  ArrowRight, 
  UploadSimple, 
  Key, 
  Eye, 
  EyeSlash, 
  Spinner, 
  Image as ImageIcon, 
  WarningCircle 
} from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

export default function BrainDumpModal({ isOpen, onClose }) {
  const { addResource, addContact, addMeeting, addTarget, setSelectedDate } = useTracker();

  // Tab State
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'photo'

  // Voice/Text Sorter States
  const [rawText, setRawText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('');

  // Photo Import States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Gemini API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [showKey, setShowKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(() => !localStorage.getItem('GEMINI_API_KEY'));

  // Unified Parsed Preview & Applied States
  const [parsedResult, setParsedResult] = useState(null);
  const [applied, setApplied] = useState(false);

  const recorderRef = useRef(null);

  // Instaniate voice recorder
  useEffect(() => {
    recorderRef.current = new VoiceNoteRecorder(
      (transcriptChunk) => {
        setRawText(prev => (prev ? prev + ' ' + transcriptChunk : transcriptChunk));
      },
      (errorMsg) => {
        setSpeechStatus(`Mic Notice: ${errorMsg}`);
        setIsRecording(false);
      }
    );
  }, []);

  // Persist API Key
  useEffect(() => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
  }, [apiKey]);

  // Global Clipboard Image Paste Listener
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      if (!isOpen) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setActiveTab('photo');
            handleImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isOpen]);

  // Voice recording toggle
  const toggleRecording = () => {
    if (!recorderRef.current.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please type or paste your voice notes in the text box below!');
      return;
    }

    if (isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
      setSpeechStatus('Recording stopped.');
    } else {
      const started = recorderRef.current.start();
      if (started) {
        setIsRecording(true);
        setSpeechStatus('Listening... Speak your daily activities out loud now!');
      }
    }
  };

  // Local Text Parser
  const handleParseText = () => {
    if (!rawText.trim()) return;
    const result = parseBrainDumpText(rawText);
    setParsedResult({
      selectedDate: null, // Keep current context date
      resources: result.resources,
      contacts: result.contacts,
      meetings: result.meetings,
      targets: result.targets
    });
    setErrorMsg('');
  };

  // Image handlers
  const handleImageFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    setParsedResult(null);
    setErrorMsg('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageFile(files[0]);
    } else {
      setErrorMsg('Ugh! Not image file. Drop image photo only!');
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const getBase64DataOnly = (dataUrl) => {
    const commaIndex = dataUrl.indexOf(',');
    return dataUrl.substring(commaIndex + 1);
  };

  const getMimeType = (dataUrl) => {
    const colonIndex = dataUrl.indexOf(':');
    const semicolonIndex = dataUrl.indexOf(';');
    return dataUrl.substring(colonIndex + 1, semicolonIndex);
  };

  // Gemini API Multimodal Parse
  const handleExtractPhoto = async () => {
    if (!imagePreviewUrl) return;
    if (!apiKey.trim()) {
      setErrorMsg('Ugh! Key empty. Need Gemini API key to parse!');
      return;
    }

    setIsExtracting(true);
    setErrorMsg('');
    setParsedResult(null);

    try {
      const base64Data = getBase64DataOnly(imagePreviewUrl);
      const mimeType = getMimeType(imagePreviewUrl);
      const cleanKey = apiKey.trim();

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${cleanKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                },
                {
                  text: `You are an expert OCR and physical daily tracking form parser. Analyze the image/photo of this physical tracking form. 
                  Identify resources, contacts, meetings, and target companies corresponding to the 15-10-2 rule.
                  
                  Return a single JSON object matching this structure. Do NOT wrap output in markdown code blocks like \`\`\`json. Return ONLY raw JSON text.

                  {
                    "selectedDate": "YYYY-MM-DD",
                    "resources": [
                      { "name": "Resource Name / Description", "category": "Company Directory|Job Board|Professional Association|Industry Publication|Target Employer|Network Community|General Notes", "notes": "Any handwritten notes" }
                    ],
                    "contacts": [
                      { "name": "Contact Name", "organization": "Organization", "emailPhone": "Email/Phone/LinkedIn info", "comments": "Written details/comments", "kindOfContact": "Network Call|LinkedIn Message|Résumé|Application|Thank-you note|Referral Reachout|Networking Group|Friend/Family|Former Coworker", "followUpDate": "YYYY-MM-DD" }
                    ],
                    "meetings": [
                      { "name": "Contact Name", "organization": "Organization", "emailPhone": "Email/Phone/LinkedIn info", "comments": "Written meeting details/notes", "kindOfMeeting": "Informational Interview|Job Interview|Networking Coffee / Call", "followUpDate": "YYYY-MM-DD" }
                    ],
                    "targets": [
                      "TARGET_COMPANY_NAME"
                    ]
                  }`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error("Gemini returned empty response parts.");
      }

      let cleanJson = generatedText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanJson);
      
      const sanitized = {
        selectedDate: parsed.selectedDate || null,
        resources: Array.isArray(parsed.resources) ? parsed.resources : [],
        contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
        meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
        targets: Array.isArray(parsed.targets) ? parsed.targets : []
      };

      setParsedResult(sanitized);
    } catch (err) {
      console.error("Gemini parse error:", err);
      setErrorMsg(`Ugh! Error extraction: ${err.message}. Check key or photo!`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Mock Photo Parser
  const handleSimulatePhoto = () => {
    setIsExtracting(true);
    setErrorMsg('');
    setParsedResult(null);

    setTimeout(() => {
      const mockData = {
        selectedDate: new Date().toISOString().split('T')[0],
        resources: [
          { name: "Ancestry Careers Web Portal", category: "Company Directory", notes: "Identified 3 active engineer jobs" },
          { name: "Utah Tech Alliance Contact List", category: "Network Community", notes: "Found recruiters for Workday & Adobe" },
          { name: "LinkedIn Alumni Directory - Qualtrics", category: "Target Employer", notes: "Located 4 software engineers in my ward/stake" }
        ],
        contacts: [
          {
            name: "SARAH SMITH",
            organization: "QUALTRICS",
            emailPhone: "sarah.smith@qualtrics.demo",
            comments: "Sent resume and portfolio. Friendly alumni contact.",
            kindOfContact: "Referral Reachout",
            followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            name: "DAVE PETERSON",
            organization: "ANCESTRY.COM",
            emailPhone: "davep@ancestry.com",
            comments: "Connected via LinkedIn, sent thank-you note.",
            kindOfContact: "Thank-you note",
            followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ],
        meetings: [
          {
            name: "ROB JEX",
            organization: "CHURCH NETWORKING",
            emailPhone: "rjex@church.org",
            comments: "Face-to-face chat at chapel. Offered referrals.",
            kindOfMeeting: "Networking Coffee / Call",
            followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ],
        targets: ["QUALTRICS", "ANCESTRY.COM"]
      };
      setParsedResult(mockData);
      setIsExtracting(false);
    }, 1200);
  };

  // Unified Database Committer
  const handleApplyAll = () => {
    if (!parsedResult) return;

    if (parsedResult.selectedDate) {
      setSelectedDate(parsedResult.selectedDate);
    }

    parsedResult.resources.forEach(r => addResource(r));
    parsedResult.contacts.forEach(c => addContact({
      name: c.name,
      organization: c.organization,
      emailPhone: c.emailPhone || c.linkedinUrl || '',
      comments: c.comments,
      kindOfContact: c.kindOfContact,
      followUpDate: c.followUpDate
    }));
    parsedResult.meetings.forEach(m => addMeeting({
      name: m.name,
      organization: m.organization,
      emailPhone: m.emailPhone || m.linkedinUrl || '',
      comments: m.comments,
      kindOfMeeting: m.kindOfMeeting,
      followUpDate: m.followUpDate
    }));
    parsedResult.targets.forEach(t => addTarget(t));

    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
      // Reset Modal content states
      setRawText('');
      setImageFile(null);
      setImagePreviewUrl('');
      setParsedResult(null);
      setErrorMsg('');
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <Sparkle className="text-purple-500" size={24} weight="fill" />
            AI Daily Journal Scraper (Brain Dump)
          </DialogTitle>
          <DialogDescription className="sr-only">
            Import notes via text, voice, or photo
          </DialogDescription>
        </DialogHeader>

        {/* Tab Toggle Bar */}
        <div className="flex border-b mb-5 gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('text'); setParsedResult(null); setErrorMsg(''); }}
            className={`py-2.5 px-5 text-sm font-bold bg-transparent border-none border-b-2 cursor-pointer transition-colors ${
              activeTab === 'text' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Voice & Text Dump
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('photo'); setParsedResult(null); setErrorMsg(''); }}
            className={`py-2.5 px-5 text-sm font-bold bg-transparent border-none border-b-2 cursor-pointer transition-colors ${
              activeTab === 'photo' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Physical Form Photo
          </button>
        </div>

        {/* TAB 1: Voice & Text Sorter */}
        {activeTab === 'text' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dump chaotic thoughts, unorganized daily updates, or speak voice notes out loud. The local parser automatically categorizes everything into your 15-10-2 tracker!
            </p>

            {/* Voice Recording Control */}
            <div className="flex items-center gap-3.5 bg-secondary/50 p-3 rounded-md border">
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={toggleRecording}
              >
                {isRecording ? <MicrophoneSlash size={16} className="mr-2" /> : <Microphone size={16} className="mr-2" />}
                {isRecording ? 'Stop Recording' : 'Record Voice Note'}
              </Button>

              <span className={`text-sm font-medium ${isRecording ? 'text-destructive' : 'text-muted-foreground'}`}>
                {speechStatus || 'Tap mic to speak notes, or type below.'}
              </span>
            </div>

            {/* Text Area Input */}
            <div className="space-y-1.5">
              <Label htmlFor="brain-dump-input">
                Raw Unorganized Notes / Voice Transcript
              </Label>
              <Textarea
                id="brain-dump-input"
                rows={5}
                placeholder="e.g. Met John Doe for an informational chat. Also found TechCorp engineering job post and messaged Jane Doe on LinkedIn..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRawText('')}>Clear Text</Button>
              <Button onClick={handleParseText}>
                <Sparkle size={16} className="mr-2" weight="fill" />
                Sort Chaos Locally
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: Photo Form Import */}
        {activeTab === 'photo' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Take photo of printed Form PD10048654 daily tracker, copy it, and hit <strong>Cmd+V / Ctrl+V</strong> here to paste! Or drag and drop file below.
            </p>

            {/* Gemini API Key Block */}
            {!isEditingKey ? (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 text-primary p-3 rounded-md text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Check size={16} weight="bold" />
                  <span>Gemini API Key configured and stored locally.</span>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setIsEditingKey(true)} 
                  className="text-blue-600 p-0 h-auto font-bold"
                >
                  Change Key
                </Button>
              </div>
            ) : (
              <div className="bg-secondary/30 p-3 rounded-md border space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gemini-key-input" className="flex items-center gap-1.5 text-foreground font-bold">
                    <Key size={14} className="text-blue-500" weight="fill" />
                    Gemini API Key (Local Setup)
                  </Label>
                  <div className="flex gap-3 items-center">
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Get Free Key ↗
                    </a>
                    {apiKey.trim() && (
                      <Button 
                        variant="link" 
                        onClick={() => setIsEditingKey(false)} 
                        className="text-emerald-700 font-bold p-0 h-auto text-xs"
                      >
                        Done
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 relative">
                  <Input
                    id="gemini-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Paste your AI Studio API key here..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-0 top-0 h-full text-muted-foreground hover:bg-transparent"
                  >
                    {showKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 relative ${
                isDragging ? 'border-dashed border-purple-500 bg-secondary' : 'border-dashed border-border bg-card'
              }`}
              onClick={() => document.getElementById('form-file-picker').click()}
            >
              <input
                id="form-file-picker"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {imagePreviewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src={imagePreviewUrl} 
                    alt="Pasted Form Preview" 
                    className="max-h-[180px] max-w-full rounded-sm border shadow-sm"
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    {imageFile ? `${imageFile.name} loaded.` : 'Pasted photo loaded.'} Click to replace.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="bg-secondary p-2.5 rounded-full text-foreground">
                    <UploadSimple size={24} weight="bold" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Drag & drop form photo here</span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      or click to select photo, or copy image & hit <strong>Cmd+V / Ctrl+V</strong> anywhere!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Sorter Controls */}
            <div className="flex justify-between gap-3 flex-wrap mt-2">
              <div>
                {imagePreviewUrl && (
                  <Button variant="outline" onClick={() => {
                      setImagePreviewUrl('');
                      setImageFile(null);
                      setParsedResult(null);
                      setErrorMsg('');
                    }}
                  >
                    Clear Photo
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleSimulatePhoto} disabled={isExtracting}>
                  Simulate Demo Extraction
                </Button>
                
                <Button 
                  onClick={handleExtractPhoto}
                  disabled={isExtracting || !imagePreviewUrl}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isExtracting ? (
                    <>
                      <Spinner size={16} className="animate-spin mr-2" />
                      Reading Photo...
                    </>
                  ) : (
                    <>
                      <Sparkle size={16} className="mr-2" weight="fill" />
                      Extract Data with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm mt-4 font-semibold">
            <WarningCircle size={16} weight="fill" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Unified Parsing Preview Panel */}
        {parsedResult && (
          <div className="bg-secondary/30 border rounded-md p-5 flex flex-col gap-4 max-h-[320px] overflow-y-auto mt-4">
            
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm flex items-center gap-2 font-extrabold uppercase">
                <Check className="text-emerald-600" size={16} weight="bold" />
                AI Sorter Results Preview
              </h4>
              {parsedResult.selectedDate && (
                <span className="text-xs font-bold text-muted-foreground">
                  Form Date: {parsedResult.selectedDate}
                </span>
              )}
            </div>

            {/* Resources list */}
            {parsedResult.resources.length > 0 && (
              <div>
                <h5 className="text-xs font-extrabold text-blue-600 uppercase mb-1.5">
                  Daily Resources ({parsedResult.resources.length})
                </h5>
                <div className="flex flex-col gap-1 pl-1.5">
                  {parsedResult.resources.map((r, i) => (
                    <div key={`ext_r_${i}`} className="text-sm text-foreground">
                      • {r.name} <span className="text-xs text-muted-foreground">({r.category})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts list */}
            {parsedResult.contacts.length > 0 && (
              <div>
                <h5 className="text-xs font-extrabold text-emerald-600 uppercase mb-1.5">
                  Contacts Made ({parsedResult.contacts.length})
                </h5>
                <div className="flex flex-col gap-2 pl-1.5">
                  {parsedResult.contacts.map((c, i) => (
                    <div key={`ext_c_${i}`} className="text-sm border-b border-dashed border-border pb-2">
                      <div className="font-bold text-foreground">{c.name} ({c.organization || 'No Org'})</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{c.emailPhone || 'No contact details'} | {c.kindOfContact} | Follow-up: {c.followUpDate}</div>
                      {c.comments && <div className="italic text-xs text-muted-foreground mt-1">"{c.comments}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meetings list */}
            {parsedResult.meetings.length > 0 && (
              <div>
                <h5 className="text-xs font-extrabold text-purple-600 uppercase mb-1.5">
                  Meetings scheduled ({parsedResult.meetings.length})
                </h5>
                <div className="flex flex-col gap-2 pl-1.5">
                  {parsedResult.meetings.map((m, i) => (
                    <div key={`ext_m_${i}`} className="text-sm border-b border-dashed border-border pb-2">
                      <div className="font-bold text-foreground">{m.name} ({m.organization || 'No Org'})</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{m.emailPhone || 'No contact details'} | {m.kindOfMeeting} | Follow-up: {m.followUpDate}</div>
                      {m.comments && <div className="italic text-xs text-muted-foreground mt-1">"{m.comments}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targets list */}
            {parsedResult.targets.length > 0 && (
              <div>
                <h5 className="text-xs font-extrabold text-rose-600 uppercase mb-1.5">
                  Target Companies Added ({parsedResult.targets.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {parsedResult.targets.map((t, i) => (
                    <span key={`ext_t_${i}`} className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-1.5 font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button 
                onClick={handleApplyAll}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {applied ? <Check size={16} className="mr-2" weight="bold" /> : <ArrowRight size={16} className="mr-2" weight="bold" />}
                {applied ? 'Ugh! Items Added!' : 'Apply All to Activity Tracker'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
