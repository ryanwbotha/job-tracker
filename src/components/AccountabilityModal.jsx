import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { Share2, Copy, Check, X, Award } from 'lucide-react';

export default function AccountabilityModal({ isOpen, onClose }) {
  const { selectedDate, resources, contacts, meetings, targets } = useTracker();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resourceCount = resources.length;
  const contactCount = contacts.length;
  const meetingCount = meetings.length;

  const summaryText = `📅 *Daily 15-10-2 Job Search Accountability Update*
Date: ${selectedDate}

🎯 *Daily Numbers*:
- 🔍 Resources Identified: ${resourceCount} / 15
- 👥 Contacts Made: ${contactCount} / 10
- 🤝 Face-to-Face Meetings: ${meetingCount} / 2

👥 *Key Contacts & Auto Follow-ups*:
${contacts.map(c => `• ${c.name} (${c.organization || 'General'}) - ${c.kindOfContact} | Follow-up: ${formatFriendlyDate(c.followUpDate)}`).join('\n') || '• No contacts logged today yet.'}

🤝 *Face-to-Face Meetings*:
${meetings.map(m => `• ${m.name} (${m.organization || 'Org'}) - ${m.kindOfMeeting} | Follow-up: ${formatFriendlyDate(m.followUpDate)}`).join('\n') || '• No meetings logged today yet.'}

🏢 *Active Target Companies*: ${targets.join(', ')}

#15102JobSearch #Accountability #SelfReliance`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Award color="var(--accent-emerald)" size={22} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Daily Accountability Update</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Copy this formatted report to share with your mentor, accountability group, Slack, or WhatsApp chat.
        </p>

        <div className="email-body-box" style={{ fontFamily: 'monospace', fontSize: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
          {summaryText}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-emerald" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Update Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
