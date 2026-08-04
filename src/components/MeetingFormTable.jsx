import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MEETING_TYPES, getDefaultFollowUpForMeetingType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Video, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import Linkedin from './LinkedinIcon';

export default function MeetingFormTable() {
  const { meetings, addMeeting, updateMeeting, deleteMeeting } = useTracker();
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [comments, setComments] = useState('');
  const [kindOfMeeting, setKindOfMeeting] = useState('Informational Interview');
  const [followUpDate, setFollowUpDate] = useState(() => calculateFollowUpDate(3));

  const handleKindChange = (e) => {
    const selectedKind = e.target.value;
    setKindOfMeeting(selectedKind);
    const autoDays = getDefaultFollowUpForMeetingType(selectedKind);
    setFollowUpDate(calculateFollowUpDate(autoDays));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMeeting({
      name,
      organization,
      emailPhone,
      linkedinUrl,
      comments,
      kindOfMeeting,
      followUpDate
    });

    setName('');
    setOrganization('');
    setEmailPhone('');
    setLinkedinUrl('');
    setComments('');
    setKindOfMeeting('Informational Interview');
    setFollowUpDate(calculateFollowUpDate(3));
    setShowAdd(false);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <Video size={22} color="var(--accent-purple)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Face-to-Face Meetings (Goal: 2)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Target two face-to-face or video meetings daily (Informational or Job interviews).
            </p>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Cancel adding meeting' : 'Add new meeting'} style={{ background: 'var(--accent-purple)' }}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Meeting'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="expandable-panel" style={{ background: '#f8fafc', padding: '1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label htmlFor="meeting-name-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Contact / Interviewer Name *</label>
              <input
                id="meeting-name-input"
                type="text"
                className="input-field"
                placeholder="e.g. Rob Jex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="meeting-org-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Organization</label>
              <input
                id="meeting-org-input"
                type="text"
                className="input-field"
                placeholder="e.g. Adobe.com"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="meeting-emailphone-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email / Phone</label>
              <input
                id="meeting-emailphone-input"
                type="text"
                className="input-field"
                placeholder="rob.jex@church.org"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="meeting-linkedin-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LinkedIn Profile URL</label>
              <input
                id="meeting-linkedin-input"
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
              <label htmlFor="meeting-kind-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kind of Meeting (Preset)</label>
              <select id="meeting-kind-select" className="select-field" value={kindOfMeeting} onChange={handleKindChange}>
                {MEETING_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="meeting-followup-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Auto Follow-up Date</label>
              <input
                id="meeting-followup-input"
                type="date"
                className="input-field"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="meeting-comments-input" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Meeting Results / Comments</label>
              <input
                id="meeting-comments-input"
                type="text"
                className="input-field"
                placeholder="Key takeaways, thank-you follow-up items"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" aria-label="Save meeting" style={{ width: '100%', background: 'var(--accent-purple)' }}>
                Save Meeting
              </button>
            </div>
          </div>
        </form>
      )}

      {meetings.length === 0 ? (
        <div className="empty-state">
          <Video className="empty-state-icon" />
          <p>No face-to-face meetings scheduled for today. Click "Add Meeting" above.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table" aria-label="Meetings list table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Organization</th>
                <th>Email / Phone / LinkedIn</th>
                <th>Kind of Meeting</th>
                <th>Comments / Results</th>
                <th>Follow-up Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>{m.organization || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '16px' }}>
                      <span>{m.emailPhone || '—'}</span>
                      {m.linkedinUrl && (
                        <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                          <Linkedin size={14} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{m.kindOfMeeting}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '280px' }}>{m.comments || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '16px', fontWeight: 600, color: '#6d28d9' }}>
                      <Clock size={14} />
                      <span>{formatFriendlyDate(m.followUpDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${m.status === 'Completed' ? 'badge-blue' : 'badge-amber'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => updateMeeting(m.id, { status: m.status === 'Completed' ? 'Upcoming' : 'Completed' })}
                        style={{ background: 'transparent', border: 'none', color: m.status === 'Completed' ? 'var(--text-muted)' : 'var(--accent-purple)', cursor: 'pointer', minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={`Toggle status for meeting ${m.name}`}
                        title="Toggle status"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMeeting(m.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', minWidth: '36px', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label={`Delete meeting ${m.name}`}
                        title="Delete meeting"
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
