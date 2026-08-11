import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { VoiceNoteRecorder } from '../utils/speechRecognizer';
import { parseBrainDumpText } from '../utils/brainDumpParser';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  Upload, 
  Key, 
  Eye, 
  EyeOff, 
  Loader2, 
  Image as ImageIcon, 
  AlertCircle 
} from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PRIMARY = `${BTN_BASE} border-indigo-600 bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200`;
const BTN_SECONDARY = `${BTN_BASE} border-border-color bg-bg-card px-5 py-2.5 text-text-primary hover:bg-bg-elevated focus-visible:ring-slate-200`;
const BTN_EMERALD = `${BTN_BASE} border-emerald-600 bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200`;
const BTN_PURPLE = `${BTN_BASE} border-violet-600 bg-violet-600 px-5 py-2.5 text-white hover:bg-violet-700 focus-visible:ring-violet-200`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const CLOSE_BTN = "inline-flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer border-none bg-transparent";

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-5 animate-fadeIn" onClick={onClose}>
      <div className="bg-bg-card border border-border-color rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col gap-4.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles color="var(--accent-purple)" size={22} />
            <h2 className="text-[1.25rem] font-bold text-text-primary">AI Daily Journal Scraper (Brain Dump)</h2>
          </div>
          <button className={CLOSE_BTN} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle Bar */}
        <div className="flex border-b border-border-color mb-5 gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab('text'); setParsedResult(null); setErrorMsg(''); }}
            className={`py-2.5 px-5 text-[0.85rem] font-bold bg-transparent border-none border-b-3 cursor-pointer transition-all duration-150 ${
              activeTab === 'text' ? 'border-accent-purple text-accent-purple' : 'border-transparent text-text-secondary'
            }`}
          >
            Voice & Text Dump
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('photo'); setParsedResult(null); setErrorMsg(''); }}
            className={`py-2.5 px-5 text-[0.85rem] font-bold bg-transparent border-none border-b-3 cursor-pointer transition-all duration-150 ${
              activeTab === 'photo' ? 'border-accent-purple text-accent-purple' : 'border-transparent text-text-secondary'
            }`}
          >
            Physical Form Photo
          </button>
        </div>

        {/* TAB 1: Voice & Text Sorter */}
        {activeTab === 'text' && (
          <div className="flex flex-col gap-4">
            <p className="text-[0.825rem] text-text-secondary">
              Dump chaotic thoughts, unorganized daily updates, or speak voice notes out loud. The local parser automatically categorizes everything into your 15-10-2 tracker!
            </p>

            {/* Voice Recording Control */}
            <div className="flex items-center gap-3.5 bg-slate-50 p-[0.75rem_1rem] rounded-md border border-border-color">
              <button
                type="button"
                className={isRecording ? BTN_EMERALD : BTN_PRIMARY}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isRecording ? 'Stop Recording' : 'Record Voice Note'}</span>
              </button>

              <span className={`text-[0.8rem] font-medium ${isRecording ? 'text-emerald-700' : 'text-text-muted'}`}>
                {speechStatus || 'Tap mic to speak notes, or type below.'}
              </span>
            </div>

            {/* Text Area Input */}
            <div>
              <label htmlFor="brain-dump-input" className="text-[0.75rem] text-text-secondary block mb-1.5 font-semibold">
                Raw Unorganized Notes / Voice Transcript
              </label>
              <textarea
                id="brain-dump-input"
                className={INPUT_FIELD}
                rows={5}
                placeholder="e.g. Met Rob Jex at church today for an informational chat about self reliance leadership. Also found Ancestry.com engineering job post and messaged Dave North on LinkedIn..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" className={BTN_SECONDARY} onClick={() => setRawText('')}>Clear Text</button>
              <button type="button" className={BTN_PRIMARY} onClick={handleParseText}>
                <Sparkles size={16} />
                <span>Sort Chaos Locally</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Photo Form Import */}
        {activeTab === 'photo' && (
          <div className="flex flex-col gap-4">
            <p className="text-[0.825rem] text-text-secondary">
              Take photo of printed Form PD10048654 daily tracker, copy it, and hit <strong>Cmd+V / Ctrl+V</strong> here to paste! Or drag and drop file below.
            </p>

            {/* Gemini API Key Block */}
            {!isEditingKey ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 p-[0.65rem_1rem] rounded-md text-[0.8rem] font-medium">
                <div className="flex items-center gap-1.5">
                  <Check size={15} className="text-emerald-800" />
                  <span>Gemini API Key configured and stored locally.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsEditingKey(true)} 
                  className="bg-transparent border-none text-blue-700 font-bold cursor-pointer p-0"
                >
                  Change Key
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-[0.75rem_1rem] rounded-md border border-border-color">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="gemini-key-input" className="text-[0.75rem] font-bold flex items-center gap-1.5 text-text-primary">
                    <Key size={14} color="var(--accent-blue)" />
                    <span>Gemini API Key (Local Setup)</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[0.725rem] text-blue-700 font-semibold no-underline"
                      title="Get free API Key from Google AI Studio"
                    >
                      Get Free Key ↗
                    </a>
                    {apiKey.trim() && (
                      <button 
                        type="button" 
                        onClick={() => setIsEditingKey(false)} 
                        className="bg-transparent border-none text-emerald-800 font-bold cursor-pointer text-[0.725rem] p-0"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 relative">
                  <input
                    id="gemini-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Paste your AI Studio API key here..."
                    className="flex-1 p-[0.45rem_2.25rem_0.45rem_0.65rem] text-[0.8rem] border border-border-color rounded-sm outline-none bg-bg-input text-text-primary"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-text-muted cursor-pointer p-0"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 rounded-lg p-[2rem_1.5rem] text-center cursor-pointer transition-all duration-200 relative ${
                isDragging ? 'border-dashed border-accent-purple bg-bg-elevated' : 'border-dashed border-border-color bg-bg-card'
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
                    className="max-h-[180px] max-w-full rounded-sm border border-border-color shadow-sm"
                  />
                  <span className="text-[0.725rem] text-text-secondary font-medium">
                    {imageFile ? `${imageFile.name} loaded.` : 'Pasted photo loaded.'} Click to replace.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="bg-[#f5f3ff] p-2.5 rounded-full text-accent-purple">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-[0.85rem] font-bold text-text-primary">Drag & drop form photo here</span>
                    <span className="text-[0.8rem] text-text-muted block mt-1">
                      or click to select photo, or copy image & hit <strong>Cmd+V / Ctrl+V</strong> anywhere!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Sorter Controls */}
            <div className="flex justify-between gap-3 flex-wrap">
              <div>
                {imagePreviewUrl && (
                  <button 
                    type="button" 
                    className={BTN_SECONDARY} 
                    onClick={() => {
                      setImagePreviewUrl('');
                      setImageFile(null);
                      setParsedResult(null);
                      setErrorMsg('');
                    }}
                  >
                    Clear Photo
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  className={BTN_SECONDARY} 
                  onClick={handleSimulatePhoto}
                  disabled={isExtracting}
                >
                  <span>Simulate Demo Extraction</span>
                </button>
                
                <button 
                  type="button" 
                  onClick={handleExtractPhoto}
                  disabled={isExtracting || !imagePreviewUrl}
                  className={`${BTN_PURPLE} flex items-center gap-1.5`}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Reading Photo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Extract Data with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-[0.8rem] mt-4 font-semibold">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Unified Parsing Preview Panel */}
        {parsedResult && (
          <div className="bg-slate-50 border border-border-color rounded-md p-5 flex flex-col gap-3.5 max-h-[320px] overflow-y-auto mt-[1.15rem]">
            
            <div className="flex items-center justify-between border-b border-border-color pb-2">
              <h4 className="text-[0.9rem] flex items-center gap-2 font-extrabold uppercase">
                <Check color="#047857" size={16} />
                <span>AI Sorter Results Preview</span>
              </h4>
              {parsedResult.selectedDate && (
                <span className="text-[0.75rem] font-bold text-text-muted">
                  Form Date: {parsedResult.selectedDate}
                </span>
              )}
            </div>

            {/* Resources list */}
            {parsedResult.resources.length > 0 && (
              <div>
                <h5 className="text-[0.75rem] font-extrabold text-blue-700 uppercase mb-1">
                  Daily Resources ({parsedResult.resources.length})
                </h5>
                <div className="flex flex-col gap-1 pl-1.5">
                  {parsedResult.resources.map((r, i) => (
                    <div key={`ext_r_${i}`} className="text-[0.775rem] text-text-primary">
                      • {r.name} <span className="text-[0.7rem] text-text-muted">({r.category})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts list */}
            {parsedResult.contacts.length > 0 && (
              <div>
                <h5 className="text-[0.75rem] font-extrabold text-emerald-800 uppercase mb-1">
                  Contacts Made ({parsedResult.contacts.length})
                </h5>
                <div className="flex flex-col gap-1.5 pl-1.5">
                  {parsedResult.contacts.map((c, i) => (
                    <div key={`ext_c_${i}`} className="text-[0.775rem] border-b border-dashed border-slate-200 pb-1">
                      <div className="font-bold text-text-primary">{c.name} ({c.organization || 'No Org'})</div>
                      <div className="text-text-secondary text-[0.725rem]">{c.emailPhone || 'No contact details'} | {c.kindOfContact} | Follow-up: {c.followUpDate}</div>
                      {c.comments && <div className="italic text-[0.7rem] text-text-muted">"{c.comments}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meetings list */}
            {parsedResult.meetings.length > 0 && (
              <div>
                <h5 className="text-[0.75rem] font-extrabold text-purple-700 uppercase mb-1">
                  Meetings scheduled ({parsedResult.meetings.length})
                </h5>
                <div className="flex flex-col gap-1.5 pl-1.5">
                  {parsedResult.meetings.map((m, i) => (
                    <div key={`ext_m_${i}`} className="text-[0.775rem] border-b border-dashed border-slate-200 pb-1">
                      <div className="font-bold text-text-primary">{m.name} ({m.organization || 'No Org'})</div>
                      <div className="text-text-secondary text-[0.725rem]">{m.emailPhone || 'No contact details'} | {m.kindOfMeeting} | Follow-up: {m.followUpDate}</div>
                      {m.comments && <div className="italic text-[0.7rem] text-text-muted">"{m.comments}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targets list */}
            {parsedResult.targets.length > 0 && (
              <div>
                <h5 className="text-[0.75rem] font-extrabold text-rose-700 uppercase mb-1">
                  Target Companies Added ({parsedResult.targets.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResult.targets.map((t, i) => (
                    <span key={`ext_t_${i}`} className="text-[0.7rem] bg-rose-50 text-rose-700 border border-rose-200 rounded-sm p-[0.15rem_0.4rem] font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-2 border-t border-border-color pt-3">
              <button 
                type="button" 
                onClick={handleApplyAll}
                className={`${BTN_EMERALD} flex items-center gap-1.5`}
              >
                {applied ? <Check size={16} /> : <ArrowRight size={16} />}
                <span>{applied ? 'Ugh! Items Added!' : 'Apply All to Activity Tracker'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
