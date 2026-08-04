import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { X, FileText } from 'lucide-react';

export default function PaperFormModal({ isOpen, onClose }) {
  const { selectedDate, resources, contacts, meetings, targets } = useTracker();

  if (!isOpen) return null;

  // Pad resources array to 15 slots matching paper sheet
  const resourceSlots = Array.from({ length: 15 }, (_, i) => resources[i] || null);

  // Pad contacts array to 10 slots matching paper sheet
  const contactSlots = Array.from({ length: 10 }, (_, i) => contacts[i] || null);

  // Pad meetings array to 2 slots matching paper sheet
  const meetingSlots = Array.from({ length: 2 }, (_, i) => meetings[i] || null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '960px', width: '95%', background: '#ffffff', color: '#0f172a', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Controls Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText color="#2563eb" size={22} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Official 15-10-2 Paper Form Web Replica</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Paper Sheet Container (Mirrors Form PD10048654) */}
        <div style={{ border: '2px solid #0f172a', padding: '1.25rem', fontFamily: 'sans-serif', fontSize: '0.825rem', background: '#ffffff' }}>
          {/* Paper Title Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0, color: '#0f172a' }}>
              Daily Activity Tracking Form
            </h2>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
              PD10048654
            </div>
          </div>

          {/* Date Row */}
          <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '0.4rem', marginBottom: '0.75rem', fontWeight: 700 }}>
            Date: <span style={{ textDecoration: 'underline', color: '#1d4ed8' }}>{selectedDate}</span>
          </div>

          {/* Instructions & Daily Resources Identified Split Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #0f172a', marginBottom: '1rem' }}>
            {/* Left Instructions Box */}
            <div style={{ padding: '0.65rem', borderRight: '1px solid #0f172a', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Instructions</h4>
              <ul style={{ paddingLeft: '1.1rem', margin: 0, lineHeight: 1.4, fontSize: '0.775rem', color: '#334155' }}>
                <li><strong>Contact name:</strong> Record the contact's name.</li>
                <li><strong>Organization:</strong> Record company or organization name.</li>
                <li><strong>Email and phone:</strong> Record email address and phone number.</li>
                <li><strong>Comments:</strong> Record results, follow-up items, and LinkedIn links.</li>
                <li><strong>Kind of contact:</strong> Application, résumé, thank-you note, employer call, network call, referral reachout.</li>
                <li><strong>Kind of meeting:</strong> Job or informational interview.</li>
                <li><strong>Follow-up date:</strong> Record date that you will call/contact.</li>
              </ul>
            </div>

            {/* Right 15 Daily Resources Box */}
            <div style={{ padding: '0.65rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Daily Resources Identified (Goal: 15)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {resourceSlots.map((res, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', padding: '0.15rem 0', display: 'flex', gap: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#94a3b8', width: '20px' }}>{i + 1}.</span>
                    <span style={{ color: res ? '#0f172a' : '#cbd5e1', fontWeight: res ? 600 : 400 }}>
                      {res ? `${res.name} (${res.category})` : '____________________________________________'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts Section (Goal: 10) */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.4rem' }}>
              Contacts Made (Goal: 10)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a', fontSize: '0.775rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Contact name</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Organization</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Email / Phone / LinkedIn</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Comments</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Kind of contact</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Follow-up date</th>
                </tr>
              </thead>
              <tbody>
                {contactSlots.map((c, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', fontWeight: 600 }}>{c ? c.name : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem' }}>{c ? c.organization : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem' }}>{c ? c.emailPhone : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', color: '#475569' }}>{c ? c.comments : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', fontWeight: 600 }}>{c ? c.kindOfContact : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', fontWeight: 700, color: '#1d4ed8' }}>{c ? formatFriendlyDate(c.followUpDate) : ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Face-to-Face Meetings Section (Goal: 2) */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.4rem' }}>
              Face-to-Face Meetings (Goal: 2)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a', fontSize: '0.775rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Contact name</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Organization</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Email / Phone / LinkedIn</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Comments</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Kind of meeting</th>
                  <th style={{ border: '1px solid #0f172a', padding: '0.4rem', textAlign: 'left' }}>Follow-up date</th>
                </tr>
              </thead>
              <tbody>
                {meetingSlots.map((m, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', fontWeight: 600 }}>{m ? m.name : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem' }}>{m ? m.organization : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem' }}>{m ? m.emailPhone : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', color: '#475569' }}>{m ? m.comments : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', fontWeight: 600 }}>{m ? m.kindOfMeeting : ' '}</td>
                    <td style={{ border: '1px solid #0f172a', padding: '0.35rem', fontWeight: 700, color: '#1d4ed8' }}>{m ? formatFriendlyDate(m.followUpDate) : ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Target Companies Footer Box */}
          <div style={{ border: '1px solid #0f172a', padding: '0.65rem', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', background: '#f8fafc' }}>
            TARGET COMPANIES: <span style={{ color: '#1d4ed8' }}>{targets.join(' • ') || 'ANCESTRY.COM • ADOBE.COM • FINTECHS'}</span>
          </div>

          {/* Official Copyright Footer Line */}
          <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'right' }}>
            © 2013 by Intellectual Reserve, Inc. All rights reserved. Printed in the USA. English approval: 6/13 PD10048654
          </div>
        </div>

        {/* Modal Close Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close Paper Form View</button>
        </div>
      </div>
    </div>
  );
}
