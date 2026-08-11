import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { Copy, Check, X, Award } from 'lucide-react';

export default function AccountabilityModal({ isOpen, onClose }) {
  const { selectedDate, resources, contacts, meetings, targets } = useTracker();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summaryText = `📅 *Daily 15-10-2 Job Search Accountability Update*
Date: ${selectedDate}

🎯 *Daily Numbers*:
- 🔍 Resources Identified: ${resources.length} / 15
- 👥 Contacts Made: ${contacts.length} / 10
- 🤝 Face-to-Face Meetings: ${meetings.length} / 2

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
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-panel"
        style={{ maxWidth: '640px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)' }}
              >
                <Award size={17} color="#10b981" />
              </div>
              <div>
                <h2 style={{ color: 'var(--text-primary)' }} className="text-base font-semibold">
                  Daily Accountability Update
                </h2>
                <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">
                  Share your progress with your mentor or accountability group
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md cursor-pointer hover:!bg-[var(--bg-elevated)] hover:!text-[var(--text-primary)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Summary box */}
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '0.75rem',
              lineHeight: '1.7',
              maxHeight: '320px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              padding: '1rem',
            }}
          >
            {summaryText}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
            <button className="btn btn-success btn-sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Update Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
