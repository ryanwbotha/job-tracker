import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Mail, Sparkles, Send, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import Linkedin from './LinkedinIcon';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

export default function PseudoEmailInbox() {
  const { emails, processIncomingEmail } = useTracker();
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0]?.id || null);

  const [rawText, setRawText] = useState('');
  const [senderHint, setSenderHint] = useState('');
  const [subjectHint, setSubjectHint] = useState('');
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  const handleProcess = (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const newEmail = processIncomingEmail(rawText, senderHint, subjectHint);
    if (newEmail) {
      setSelectedEmailId(newEmail.id);
      setRawText('');
      setSenderHint('');
      setSubjectHint('');
      setShowPasteForm(false);
      setStatusMsg('Email analyzed! Contact & auto follow-up added to tracker table.');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const loadSampleEmail = (sampleType) => {
    if (sampleType === 'recruiter') {
      setSenderHint('Dave North <d.north@ancestry.com>');
      setSubjectHint('Re: Connection via Tyler Jensen / Ancestry Opportunity');
      setRawText(`From: Dave North <d.north@ancestry.com>
Subject: Re: Connection via Tyler Jensen / Ancestry Opportunity

Hi Ryan,

Thanks for reaching out via Tyler Jensen! I would be glad to chat about opportunities here at Ancestry.com.
We have an opening on our product engineering team. Check out my LinkedIn profile (https://linkedin.com/in/dave-north-demo) and let me know if you have time for a 15-minute call on Thursday at 2 PM MT.

Best regards,
Dave North
Senior Recruiter @ Ancestry`);
    } else {
      setSenderHint('Sarah Connor <s.connor@cyberdyne.io>');
      setSubjectHint('Thanks for taking the time to chat today!');
      setRawText(`From: Sarah Connor <s.connor@cyberdyne.io>
Subject: Thanks for taking the time to chat today!

Hi Ryan,

Great speaking with you about the Senior Frontend Engineer role. I really enjoyed our conversation.
Let's touch base again early next week to discuss the next steps with the hiring team.

Best,
Sarah`);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Top Banner */}
      <Card className="p-6 md:p-8 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Mail size={24} className="text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Email Interaction Analyzer</h3>
            <p className="text-xs text-muted-foreground">
              Paste email threads to automatically extract contact details, LinkedIn links, and auto-calculate follow-up dates
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowPasteForm(!showPasteForm)}
          className="gap-2"
        >
          <Sparkles size={16} />
          <span>{showPasteForm ? 'Close Analyzer' : 'Analyze New Email'}</span>
        </Button>
      </Card>

      {/* Success Notification Banner */}
      {statusMsg && (
        <div className="p-3.5 px-4 bg-primary/10 border border-primary/20 rounded-md text-primary font-semibold text-xs flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Email Analyzer Paste Form */}
      {showPasteForm && (
        <Card className="p-6 flex flex-col gap-4 border-primary">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="text-base font-bold text-foreground">Paste Incoming Email Raw Content</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Load Sample:</span>
              <Button variant="outline" size="xs" onClick={() => loadSampleEmail('recruiter')}>Recruiter Reply</Button>
              <Button variant="outline" size="xs" onClick={() => loadSampleEmail('interview')}>Follow-up Note</Button>
            </div>
          </div>

          <form onSubmit={handleProcess} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sender (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Dave North <d.north@ancestry.com>"
                  value={senderHint}
                  onChange={(e) => setSenderHint(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Subject Line (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Re: Connection via Tyler Jensen"
                  value={subjectHint}
                  onChange={(e) => setSubjectHint(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Message Body *</label>
              <Textarea
                className="min-h-[120px]"
                placeholder="Paste full raw email body text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-1">
              <Button type="button" variant="outline" onClick={() => setShowPasteForm(false)}>Cancel</Button>
              <Button type="submit" className="gap-2">
                <Send size={15} />
                <span>Process & Extract Contact</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Inbox Viewer Layout */}
      <div className="grid grid-cols-[320px_1fr] max-md:grid-cols-1 gap-5 items-start">
        {/* Left: Email List Sidebar */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Analyzed Inbox ({emails.length})</h4>
          {emails.map(email => (
            <Card
              key={email.id}
              onClick={() => setSelectedEmailId(email.id)}
              className={`p-3 cursor-pointer transition-colors flex flex-col gap-1 ${email.id === selectedEmailId ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            >
              <div className="flex justify-between items-center">
                <strong className="text-xs font-bold text-foreground truncate">{email.senderName}</strong>
                <span className="text-[10px] text-muted-foreground">{email.timestamp}</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold truncate">{email.subject}</span>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{email.snippet}</p>
            </Card>
          ))}
        </div>

        {/* Right: Email Detail & Auto-Extracted Analysis */}
        {selectedEmail && (
          <Card className="p-6 flex flex-col gap-5">
            {/* Subject & Sender */}
            <div className="border-b border-border pb-4">
              <h4 className="text-lg font-bold text-foreground mb-1">{selectedEmail.subject}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedEmail.senderName}</span>
                <span>&lt;{selectedEmail.senderEmail}&gt;</span>
                <span>• {selectedEmail.timestamp}</span>
              </div>
            </div>

            {/* AI Auto-Extraction Insights Widget */}
            {selectedEmail.analysis && (
              <div className="bg-muted/40 border border-border p-4 rounded-lg flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">AI Contact & Task Extracted</span>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Extracted Contact:</span>
                    <strong className="text-foreground font-bold">{selectedEmail.analysis.contactName}</strong>
                    {selectedEmail.analysis.contactOrg && <span> ({selectedEmail.analysis.contactOrg})</span>}
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Sentiment / Urgency:</span>
                    <Badge variant="secondary">
                      {selectedEmail.analysis.sentiment}
                    </Badge>
                  </div>

                  {selectedEmail.analysis.linkedinUrl && (
                    <div>
                      <span className="text-muted-foreground block">LinkedIn Detected:</span>
                      <a href={selectedEmail.analysis.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Linkedin size={14} />
                        <span>Profile Link</span>
                      </a>
                    </div>
                  )}

                  <div>
                    <span className="text-muted-foreground block">Auto Follow-up Scheduled:</span>
                    <Badge variant="secondary">{selectedEmail.analysis.kindOfContact}</Badge>
                    <span className="ml-1 text-foreground font-bold">{selectedEmail.analysis.followUpDate}</span>
                  </div>
                </div>

                {selectedEmail.analysis.actionSummary && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-1">
                    <strong className="text-foreground">Suggested Action:</strong> {selectedEmail.analysis.actionSummary}
                  </div>
                )}
              </div>
            )}

            {/* Raw Email Message Content */}
            <div className="bg-muted/30 border border-border rounded-md p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
              {selectedEmail.body}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
