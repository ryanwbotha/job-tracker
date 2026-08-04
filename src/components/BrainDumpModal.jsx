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
                      { "name": "Resource Name / Description", "category": "Company Directory|Professional Association|Industry Publication|Target Employer|Network Community|General Notes", "notes": "Any handwritten notes" }
                    ],
                    "contacts": [
                      { "name": "Contact Name", "organization": "Organization", "emailPhone": "Email/Phone/LinkedIn info", "comments": "Written details/comments", "kindOfContact": "Network Call|LinkedIn Message|Résumé|Application|Thank-you note|Referral Reachout", "followUpDate": "YYYY-MM-DD" }
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles color="var(--accent-purple)" size={22} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Daily Activity Sorter (Voice/Text/Photo)</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('text'); setParsedResult(null); setErrorMsg(''); }}
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'text' ? '3px solid var(--accent-purple)' : '3px solid transparent',
              color: activeTab === 'text' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Voice & Text Dump
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('photo'); setParsedResult(null); setErrorMsg(''); }}
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'photo' ? '3px solid var(--accent-purple)' : '3px solid transparent',
              color: activeTab === 'photo' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Physical Form Photo
          </button>
        </div>

        {/* TAB 1: Voice & Text Sorter */}
        {activeTab === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Dump chaotic thoughts, unorganized daily updates, or speak voice notes out loud. The local parser automatically categorizes everything into your 15-10-2 tracker!
            </p>

            {/* Voice Recording Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className={`btn ${isRecording ? 'btn-emerald' : 'btn-primary'}`}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isRecording ? 'Stop Recording' : 'Record Voice Note'}</span>
              </button>

              <span style={{ fontSize: '0.8rem', color: isRecording ? '#047857' : 'var(--text-muted)', fontWeight: 500 }}>
                {speechStatus || 'Tap mic to speak notes, or type below.'}
              </span>
            </div>

            {/* Text Area Input */}
            <div>
              <label htmlFor="brain-dump-input" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Raw Unorganized Notes / Voice Transcript
              </label>
              <textarea
                id="brain-dump-input"
                className="textarea-field"
                rows={5}
                placeholder="e.g. Met Rob Jex at church today for an informational chat about self reliance leadership. Also found Ancestry.com engineering job post and messaged Dave North on LinkedIn..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRawText('')}>Clear Text</button>
              <button type="button" className="btn btn-primary" onClick={handleParseText}>
                <Sparkles size={16} />
                <span>Sort Chaos Locally</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Photo Form Import */}
        {activeTab === 'photo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Take photo of printed Form PD10048654 daily tracker, copy it, and hit <strong>Cmd+V / Ctrl+V</strong> here to paste! Or drag and drop file below.
            </p>

            {/* Gemini API Key Block */}
            {!isEditingKey ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={15} color="#166534" />
                  <span>Gemini API Key configured and stored locally.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsEditingKey(true)} 
                  style={{ background: 'transparent', border: 'none', color: '#1d4ed8', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Change Key
                </button>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label htmlFor="gemini-key-input" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                    <Key size={14} color="var(--accent-blue)" />
                    <span>Gemini API Key (Local Setup)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: '0.725rem', color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}
                      title="Get free API Key from Google AI Studio"
                    >
                      Get Free Key ↗
                    </a>
                    {apiKey.trim() && (
                      <button 
                        type="button" 
                        onClick={() => setIsEditingKey(false)} 
                        style={{ background: 'transparent', border: 'none', color: '#166534', fontWeight: 700, cursor: 'pointer', fontSize: '0.725rem', padding: 0 }}
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                  <input
                    id="gemini-key-input"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Paste your AI Studio API key here..."
                    style={{
                      flex: 1,
                      padding: '0.45rem 2.25rem 0.45rem 0.65rem',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0
                    }}
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
              style={{
                border: isDragging ? '2px dashed var(--accent-purple)' : '2px dashed var(--border-color)',
                background: isDragging ? '#faf5ff' : '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onClick={() => document.getElementById('form-file-picker').click()}
            >
              <input
                id="form-file-picker"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              
              {imagePreviewUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img 
                    src={imagePreviewUrl} 
                    alt="Pasted Form Preview" 
                    style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '4px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {imageFile ? `${imageFile.name} loaded.` : 'Pasted photo loaded.'} Click to replace.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ background: '#f5f3ff', padding: '0.65rem', borderRadius: '50%', color: 'var(--accent-purple)' }}>
                    <Upload size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Drag & drop form photo here</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                      or click to select photo, or copy image & hit <strong>Cmd+V / Ctrl+V</strong> anywhere!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Sorter Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div>
                {imagePreviewUrl && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
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
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleSimulatePhoto}
                  disabled={isExtracting}
                >
                  <span>Simulate Demo Extraction</span>
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleExtractPhoto}
                  disabled={isExtracting || !imagePreviewUrl}
                  style={{ background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 600 }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Unified Parsing Preview Panel */}
        {parsedResult && (
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '320px', overflowY: 'auto', marginTop: '1.15rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <Check color="#047857" size={16} />
                <span>AI Sorter Results Preview</span>
              </h4>
              {parsedResult.selectedDate && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Form Date: {parsedResult.selectedDate}
                </span>
              )}
            </div>

            {/* Resources list */}
            {parsedResult.resources.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Daily Resources ({parsedResult.resources.length})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.35rem' }}>
                  {parsedResult.resources.map((r, i) => (
                    <div key={`ext_r_${i}`} style={{ fontSize: '0.775rem', color: 'var(--text-primary)' }}>
                      • {r.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({r.category})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts list */}
            {parsedResult.contacts.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Contacts Made ({parsedResult.contacts.length})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingLeft: '0.35rem' }}>
                  {parsedResult.contacts.map((c, i) => (
                    <div key={`ext_c_${i}`} style={{ fontSize: '0.775rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.2rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name} ({c.organization || 'No Org'})</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.725rem' }}>{c.emailPhone || 'No contact details'} | {c.kindOfContact} | Follow-up: {c.followUpDate}</div>
                      {c.comments && <div style={{ fontStyle: 'italic', fontSize: '0.7rem', color: 'var(--text-muted)' }}>"{c.comments}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meetings list */}
            {parsedResult.meetings.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Meetings scheduled ({parsedResult.meetings.length})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.35rem' }}>
                  {parsedResult.meetings.map((m, i) => (
                    <div key={`ext_m_${i}`} style={{ fontSize: '0.775rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.2rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name} ({m.organization || 'No Org'})</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.725rem' }}>{m.emailPhone || 'No contact details'} | {m.kindOfMeeting} | Follow-up: {m.followUpDate}</div>
                      {m.comments && <div style={{ fontStyle: 'italic', fontSize: '0.7rem', color: 'var(--text-muted)' }}>"{m.comments}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targets list */}
            {parsedResult.targets.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Target Companies Added ({parsedResult.targets.length})
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {parsedResult.targets.map((t, i) => (
                    <span key={`ext_t_${i}`} style={{ fontSize: '0.7rem', background: '#fff1f2', color: '#be123c', border: '1px solid #ffe4e6', borderRadius: '4px', padding: '0.15rem 0.4rem', fontWeight: 700 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-emerald" 
                onClick={handleApplyAll}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
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
