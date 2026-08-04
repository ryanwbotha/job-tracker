import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Mail, Sparkles, Send, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import Linkedin from './LinkedinIcon';

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
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <Mail size={22} color="var(--accent-blue)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Email Interaction Analyzer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Forward Email Address: <code style={{ background: '#eff6ff', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#1d4ed8', fontWeight: 600 }}>forward-tracker@jobsearch.internal</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowPasteForm(!showPasteForm)}>
            <Sparkles size={15} />
            <span>{showPasteForm ? 'View Inbox' : 'Analyze New Email'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {showPasteForm ? (
        <form onSubmit={handleProcess} style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Paste Email Thread from Network Contact</h4>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => loadSampleEmail('recruiter')}>
                Load Sample 1 (Recruiter)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => loadSampleEmail('alumni')}>
                Load Sample 2 (Alumni / Network)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>From / Sender Hint</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Dave North <d.north@ancestry.com>"
                value={senderHint}
                onChange={(e) => setSenderHint(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject Line</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Re: Connection via Tyler Jensen"
                value={subjectHint}
                onChange={(e) => setSubjectHint(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Full Email Content / Thread Body *</label>
            <textarea
              className="textarea-field"
              rows={6}
              placeholder="Paste email conversation text here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowPasteForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-emerald">
              <Sparkles size={15} />
              <span>Run Interaction Analysis</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="email-sim-grid">
          {/* Email List Sidebar */}
          <div className="email-list">
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '0.25rem 0.5rem' }}>
              Inbound Conversations ({emails.length})
            </div>
            {emails.map(email => (
              <div
                key={email.id}
                className={`email-item ${email.id === selectedEmailId ? 'active' : ''}`}
                onClick={() => setSelectedEmailId(email.id)}
              >
                <div className="email-item-sender">{email.sender}</div>
                <div className="email-item-subject">{email.subject}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{email.date}</div>
              </div>
            ))}
          </div>

          {/* Email Detail View & AI Extraction Result */}
          {selectedEmail ? (
            <div className="email-detail-view">
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{selectedEmail.subject}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  From: <strong>{selectedEmail.sender}</strong> • {selectedEmail.date}
                </div>
              </div>

              <div className="email-body-box">
                {selectedEmail.body}
              </div>

              {/* AI Analysis Panel */}
              {selectedEmail.analysis && (
                <div className="ai-analysis-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} color="var(--accent-purple)" />
                      <strong style={{ fontSize: '0.875rem' }}>Email Interaction Analysis Result</strong>
                    </div>
                    <span className={`badge ${selectedEmail.analysis.sentimentBadge}`}>
                      {selectedEmail.analysis.sentiment}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', fontSize: '0.825rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Extracted Contact:</span>{' '}
                      <strong>{selectedEmail.analysis.contactName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Organization:</span>{' '}
                      <strong>{selectedEmail.analysis.organization}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Contact Type:</span>{' '}
                      <span className="badge badge-emerald">{selectedEmail.analysis.kindOfContact}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Auto Follow-up Date:</span>{' '}
                      <strong style={{ color: '#b45309' }}>{selectedEmail.analysis.followUpDate}</strong>
                    </div>
                  </div>

                  {selectedEmail.analysis.linkedinUrl && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <a href={selectedEmail.analysis.linkedinUrl} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                        <Linkedin size={14} />
                        <span>Extracted LinkedIn Profile ({selectedEmail.analysis.linkedinUrl})</span>
                      </a>
                    </div>
                  )}

                  <div style={{ background: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <UserCheck size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                    <span>{selectedEmail.analysis.comments}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <Mail className="empty-state-icon" />
              <p>No emails analyzed yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
