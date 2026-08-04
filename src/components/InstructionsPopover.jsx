import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function InstructionsPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Form Instructions"
        style={{ borderColor: '#bfdbfe', background: '#eff6ff', color: '#1d4ed8' }}
      >
        <HelpCircle size={15} />
        <span>Form Instructions</span>
      </button>

      {isOpen && (
        <div
          className="popover-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '340px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            <strong style={{ fontSize: '16px', color: '#0f172a' }}>15-10-2 Form Guidance</strong>
            <button onClick={() => setIsOpen(false)} aria-label="Close Instructions" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem', minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li><strong>Contact name:</strong> Record the contact's full name.</li>
            <li><strong>Organization:</strong> Record company or organization name.</li>
            <li><strong>Email and phone:</strong> Record email address and cell/landline number.</li>
            <li><strong>Comments:</strong> Record conversation results, follow-up notes, or LinkedIn URLs.</li>
            <li><strong>Kind of contact:</strong> Application, résumé, thank-you note, employer call, network call, referral reachout.</li>
            <li><strong>Kind of meeting:</strong> Job interview or informational interview.</li>
            <li><strong>Follow-up date:</strong> Target date you will follow up with contact.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
