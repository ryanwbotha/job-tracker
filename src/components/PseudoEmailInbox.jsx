import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Mail, Sparkles, Send, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PRIMARY = `${BTN_BASE} border-indigo-600 bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200`;
const BTN_SECONDARY = `${BTN_BASE} border-border-color bg-bg-card px-5 py-2.5 text-text-primary hover:bg-bg-elevated focus-visible:ring-slate-200`;
const BTN_EMERALD = `${BTN_BASE} border-accent-emerald bg-accent-emerald px-5 py-2.5 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200`;
const BTN_SM_PRIMARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-blue text-white hover:bg-blue-700`;
const BTN_SM_SECONDARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const LINK_CLASS = "inline-flex items-center gap-1 text-sm text-accent-blue font-medium underline-offset-2 hover:underline hover:text-accent-blue/90";
const EMAIL_BODY_BOX = "bg-bg-elevated border border-border-color rounded-md p-3.5 font-body text-[16px] leading-relaxed whitespace-pre-wrap text-text-primary";

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
Senior Engineering Manager | Ancestry.com`);
    } else if (sampleType === 'alumni') {
      setSenderHint('Leanne Cousin <leanne@usa-network.org>');
      setSubjectHint('Referral to US Tech Manager');
      setRawText(`From: Leanne Cousin <leanne@usa-network.org>
Subject: Referral to US Tech Manager

Hey Ryan,

I spoke with my contact at Qualtrics in Salt Lake. She is open to reviewing your résumé!
Here is her LinkedIn: https://linkedin.com/in/alumni-qualtrics-lead
Send her a thank-you note and mention my name. Follow up with me next Monday!

Best,
Leanne`);
    }
    setShowPasteForm(true);
  };

  return (
    <div className="bg-bg-card rounded-lg p-6 shadow-card transition-all duration-150">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Mail size={22} color="var(--accent-blue)" />
          <div>
            <h3 className="text-[1.1rem] font-bold text-text-primary">Email Interaction Analyzer</h3>
            <p className="text-[0.8rem] text-text-secondary">
              Forward Email Address: <code className="bg-[#eff6ff] p-[0.15rem_0.45rem] rounded-sm text-[#1d4ed8] font-semibold">forward-tracker@jobsearch.internal</code>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className={BTN_SM_PRIMARY} onClick={() => setShowPasteForm(!showPasteForm)}>
            <Sparkles size={15} />
            <span>{showPasteForm ? 'View Inbox' : 'Analyze New Email'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-[0.6rem_0.9rem] rounded-md mb-4 flex items-center gap-2 text-[0.85rem] font-semibold">
          <CheckCircle size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {showPasteForm ? (
        <form onSubmit={handleProcess} className="bg-slate-50 p-4.5 rounded-lg border border-border-color flex flex-col gap-3.5">
          <div className="flex justify-between items-center">
            <h4 className="text-[0.9rem] font-bold text-text-primary">Paste Email Thread from Network Contact</h4>
            <div className="flex gap-1.5">
              <button type="button" className={BTN_SM_SECONDARY} onClick={() => loadSampleEmail('recruiter')}>
                Load Sample 1 (Recruiter)
              </button>
              <button type="button" className={BTN_SM_SECONDARY} onClick={() => loadSampleEmail('alumni')}>
                Load Sample 2 (Alumni / Network)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.75rem] text-text-secondary font-semibold">From / Sender Hint</label>
              <input
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Dave North <d.north@ancestry.com>"
                value={senderHint}
                onChange={(e) => setSenderHint(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[0.75rem] text-text-secondary font-semibold">Subject Line</label>
              <input
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Re: Connection via Tyler Jensen"
                value={subjectHint}
                onChange={(e) => setSubjectHint(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[0.75rem] text-text-secondary font-semibold">Full Email Content / Thread Body *</label>
            <textarea
              className={INPUT_FIELD}
              rows={6}
              placeholder="Paste email conversation text here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className={BTN_SECONDARY} onClick={() => setShowPasteForm(false)}>Cancel</button>
            <button type="submit" className={BTN_EMERALD}>
              <Sparkles size={15} />
              <span>Run Interaction Analysis</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-[320px_1fr] max-[868px]:grid-cols-1 gap-4.5 min-h-[500px]">
          {/* Email List Sidebar */}
          <div className="bg-bg-card border border-border-color rounded-xl p-2.5 flex flex-col gap-1.5 max-h-[600px] overflow-y-auto">
            <div className="text-[0.75rem] uppercase text-text-muted font-bold p-[0.25rem_0.5rem]">
              Inbound Conversations ({emails.length})
            </div>
            {emails.map(email => (
              <div
                key={email.id}
                className={`p-3 rounded-md border cursor-pointer transition-colors flex flex-col gap-1 ${email.id === selectedEmailId ? 'bg-accent-blue/10 border-accent-blue/20 hover:bg-accent-blue/15' : 'border-transparent bg-bg-elevated hover:bg-bg-input'}`}
                onClick={() => setSelectedEmailId(email.id)}
              >
                <div className="font-semibold text-[16px] text-text-primary">{email.sender}</div>
                <div className="text-[0.85rem] text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{email.subject}</div>
                <div className="text-[0.7rem] text-text-muted">{email.date}</div>
              </div>
            ))}
          </div>

          {/* Email Detail View & AI Extraction Result */}
          {selectedEmail ? (
            <div className="bg-bg-card border border-border-color rounded-xl p-5.5 flex flex-col gap-4.5">
              <div>
                <h4 className="text-[1rem] font-bold text-text-primary mb-1">{selectedEmail.subject}</h4>
                <div className="text-[0.8rem] text-text-secondary">
                  From: <strong>{selectedEmail.sender}</strong> • {selectedEmail.date}
                </div>
              </div>

              <div className={EMAIL_BODY_BOX}>
                {selectedEmail.body}
              </div>

              {/* AI Analysis Panel */}
              {selectedEmail.analysis && (
                <div className="bg-slate-50 border border-border-color rounded-xl p-4.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} color="var(--accent-purple)" />
                      <strong className="text-[0.875rem] font-bold text-text-primary">Email Interaction Analysis Result</strong>
                    </div>
                    <span className={`${BADGE_BASE} ${selectedEmail.analysis.sentimentBadge === 'badge-emerald' ? 'bg-accent-emerald/8 text-accent-emerald' : selectedEmail.analysis.sentimentBadge === 'badge-rose' ? 'bg-accent-rose/8 text-accent-rose' : 'bg-accent-amber/8 text-amber-700'}`}>
                      {selectedEmail.analysis.sentiment}
                    </span>
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5 text-[0.825rem]">
                    <div>
                      <span className="text-text-secondary">Extracted Contact:</span>{' '}
                      <strong>{selectedEmail.analysis.contactName}</strong>
                    </div>
                    <div>
                      <span className="text-text-secondary">Organization:</span>{' '}
                      <strong>{selectedEmail.analysis.organization}</strong>
                    </div>
                    <div>
                      <span className="text-text-secondary">Contact Type:</span>{' '}
                      <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`}>{selectedEmail.analysis.kindOfContact}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Auto Follow-up Date:</span>{' '}
                      <strong className="text-[#b45309] font-bold">{selectedEmail.analysis.followUpDate}</strong>
                    </div>
                  </div>

                  {selectedEmail.analysis.linkedinUrl && (
                    <div className="mt-1">
                      <a href={selectedEmail.analysis.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        <Linkedin size={14} />
                        <span>Extracted LinkedIn Profile ({selectedEmail.analysis.linkedinUrl})</span>
                      </a>
                    </div>
                  )}

                  <div className="bg-bg-elevated p-2.5 rounded-[6px] border border-border-color text-[0.8rem] text-text-secondary mt-1 flex items-start gap-1.5">
                    <UserCheck size={14} className="mt-0.5 shrink-0" />
                    <span>{selectedEmail.analysis.comments}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 px-5 text-text-muted flex flex-col items-center gap-2.5">
              <Mail className="w-11 h-11 text-text-muted opacity-50" />
              <p>No emails analyzed yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
