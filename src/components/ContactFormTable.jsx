import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CONTACT_TYPES, getDefaultFollowUpForContactType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Users, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import Linkedin from './LinkedinIcon';

export default function ContactFormTable() {
  const { contacts, addContact, updateContact, deleteContact } = useTracker();
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [comments, setComments] = useState('');
  const [kindOfContact, setKindOfContact] = useState('Network Call');
  const [followUpDate, setFollowUpDate] = useState(() => calculateFollowUpDate(3));

  const handleKindChange = (e) => {
    const selectedKind = e.target.value;
    setKindOfContact(selectedKind);
    const autoDays = getDefaultFollowUpForContactType(selectedKind);
    setFollowUpDate(calculateFollowUpDate(autoDays));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addContact({
      name,
      organization,
      emailPhone,
      linkedinUrl,
      comments,
      kindOfContact,
      followUpDate
    });

    setName('');
    setOrganization('');
    setEmailPhone('');
    setLinkedinUrl('');
    setComments('');
    setKindOfContact('Network Call');
    setFollowUpDate(calculateFollowUpDate(3));
    setShowAdd(false);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <Users size={22} color="var(--accent-emerald)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Contacts Made (Goal: 10)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reach out daily. Automatic follow-up scheduled based on contact preset type.
            </p>
          </div>
        </div>

        <button className="btn btn-emerald btn-sm" onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Cancel adding contact' : 'Add new contact'}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Contact'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="expandable-panel" style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label htmlFor="contact-name-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Contact Name *</label>
              <input
                id="contact-name-input"
                type="text"
                className="input-field"
                placeholder="e.g. Dave North"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-org-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Organization</label>
              <input
                id="contact-org-input"
                type="text"
                className="input-field"
                placeholder="e.g. Ancestry.com"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-emailphone-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email / Phone</label>
              <input
                id="contact-emailphone-input"
                type="text"
                className="input-field"
                placeholder="d.north@ancestry.com"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-linkedin-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LinkedIn Profile URL</label>
              <input
                id="contact-linkedin-input"
                type="url"
                className="input-field"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'flex-end' }}>
            <div>
              <label htmlFor="contact-kind-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kind of Contact (Preset)</label>
              <select id="contact-kind-select" className="select-field" value={kindOfContact} onChange={handleKindChange}>
                {CONTACT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contact-followup-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Auto Follow-up Date</label>
              <input
                id="contact-followup-input"
                type="date"
                className="input-field"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-comments-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Comments / Next Steps</label>
              <input
                id="contact-comments-input"
                type="text"
                className="input-field"
                placeholder="Record results, follow-up notes"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-emerald" aria-label="Save contact" style={{ width: '100%' }}>Save Contact</button>
            </div>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <p>No contacts logged for today yet. Click "Add Contact" above.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table" aria-label="Contacts list table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Organization</th>
                <th>Email / Phone / LinkedIn</th>
                <th>Kind of Contact</th>
                <th>Comments</th>
                <th>Follow-up Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>
                    {c.name}
                  </td>
                  <td>{c.organization || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '16px' }}>
                      <span>{c.emailPhone || '—'}</span>
                      {c.linkedinUrl && (
                        <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                          <Linkedin size={14} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-emerald">{c.kindOfContact}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '280px' }}>{c.comments || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '16px', fontWeight: 600, color: '#b45309' }}>
                      <Clock size={14} />
                      <span>{formatFriendlyDate(c.followUpDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'Completed' ? 'badge-blue' : 'badge-amber'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => updateContact(c.id, { status: c.status === 'Completed' ? 'Active' : 'Completed' })}
                        style={{ background: 'transparent', border: 'none', color: c.status === 'Completed' ? 'var(--text-muted)' : 'var(--accent-emerald)', cursor: 'pointer', minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={`Toggle status for contact ${c.name}`}
                        title="Toggle status"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteContact(c.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={`Delete contact ${c.name}`}
                        title="Delete contact"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
