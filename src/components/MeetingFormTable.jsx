import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MEETING_TYPES, getDefaultFollowUpForMeetingType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Video, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PURPLE = `${BTN_BASE} border-violet-600 bg-violet-600 px-5 py-2.5 text-white hover:bg-violet-700 focus-visible:ring-violet-200`;
const BTN_SM_PURPLE = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-purple text-white hover:bg-purple-700`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const TH_CLASS = "px-3 py-2 text-left text-sm font-medium text-gray-900 whitespace-nowrap";
const TD_CLASS = "px-3 py-2 text-sm text-gray-700 whitespace-nowrap";
const LINK_CLASS = "inline-flex items-center gap-1 text-sm text-indigo-600 font-medium underline-offset-2 hover:underline hover:text-indigo-700";

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
    <div className="section-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Video size={22} color="var(--accent-purple)" />
          <div>
            <h3 className="text-[1.1rem] font-bold text-text-primary">Face-to-Face Meetings (Goal: 2)</h3>
            <p className="text-[0.85rem] text-text-secondary">
              Target two face-to-face or video meetings daily (Informational or Job interviews).
            </p>
          </div>
        </div>

        <button className={BTN_SM_PURPLE} onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Cancel adding meeting' : 'Add new meeting'}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Meeting'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-md mb-5 border border-border-color flex flex-col gap-4 animate-slide-down-fade">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div>
              <label htmlFor="meeting-name-input" className="text-[0.85rem] text-text-secondary font-semibold">Contact / Interviewer Name *</label>
              <input
                id="meeting-name-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Rob Jex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="meeting-org-input" className="text-[0.85rem] text-text-secondary font-semibold">Organization</label>
              <input
                id="meeting-org-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Adobe.com"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="meeting-emailphone-input" className="text-[0.85rem] text-text-secondary font-semibold">Email / Phone</label>
              <input
                id="meeting-emailphone-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="rob.jex@church.org"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="meeting-linkedin-input" className="text-[0.85rem] text-text-secondary font-semibold">LinkedIn Profile URL</label>
              <input
                id="meeting-linkedin-input"
                type="url"
                className={INPUT_FIELD}
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 items-end">
            <div>
              <label htmlFor="meeting-kind-select" className="text-[0.85rem] text-text-secondary font-semibold">Kind of Meeting (Preset)</label>
              <select id="meeting-kind-select" className={INPUT_FIELD} value={kindOfMeeting} onChange={handleKindChange}>
                {MEETING_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="meeting-followup-input" className="text-[0.85rem] text-text-secondary font-semibold">Auto Follow-up Date</label>
              <input
                id="meeting-followup-input"
                type="date"
                className={INPUT_FIELD}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="meeting-comments-input" className="text-[0.85rem] text-text-secondary font-semibold">Meeting Results / Comments</label>
              <input
                id="meeting-comments-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="Key takeaways, thank-you follow-up items"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className={`${BTN_PURPLE} w-full`} aria-label="Save meeting">Save Meeting</button>
            </div>
          </div>
        </form>
      )}

      {meetings.length === 0 ? (
        <div className="text-center py-10 px-5 text-text-muted flex flex-col items-center gap-2.5">
          <Video className="w-11 h-11 text-text-muted opacity-50" />
          <p>No face-to-face meetings scheduled for today. Click "Add Meeting" above.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-0" aria-label="Meetings list table">
            <thead>
              <tr>
                <th className={TH_CLASS}>Contact Name</th>
                <th className={TH_CLASS}>Organization</th>
                <th className={TH_CLASS}>Email / Phone / LinkedIn</th>
                <th className={TH_CLASS}>Kind of Meeting</th>
                <th className={TH_CLASS}>Comments / Results</th>
                <th className={TH_CLASS}>Follow-up Date</th>
                <th className={TH_CLASS}>Status</th>
                <th className={`${TH_CLASS} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(m => (
                <tr key={m.id} className="group">
                  <td className={`${TD_CLASS} font-semibold`}>{m.name}</td>
                  <td className={TD_CLASS}>{m.organization || '—'}</td>
                  <td className={TD_CLASS}>
                    <div className="flex flex-col gap-1 text-[16px]">
                      <span>{m.emailPhone || '—'}</span>
                      {m.linkedinUrl && (
                        <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                          <Linkedin size={14} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className={TD_CLASS}>
                    <span className={`${BADGE_BASE} bg-accent-purple/8 text-accent-purple`}>{m.kindOfMeeting}</span>
                  </td>
                  <td className={`${TD_CLASS} text-text-secondary text-[16px] max-w-[280px] break-words`}>{m.comments || '—'}</td>
                  <td className={TD_CLASS}>
                    <div className="flex items-center gap-1.5 text-[16px] font-semibold text-purple-700">
                      <Clock size={14} />
                      <span>{formatFriendlyDate(m.followUpDate)}</span>
                    </div>
                  </td>
                  <td className={TD_CLASS}>
                    <span className={`${BADGE_BASE} ${m.status === 'Completed' ? 'bg-accent-blue/8 text-accent-blue' : 'bg-accent-amber/8 text-amber-700'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => updateMeeting(m.id, { status: m.status === 'Completed' ? 'Upcoming' : 'Completed' })}
                        className={`bg-transparent border-none cursor-pointer w-9 h-9 flex items-center justify-center ${m.status === 'Completed' ? 'text-text-muted' : 'text-accent-purple'}`}
                        aria-label={`Toggle status for meeting ${m.name}`}
                        title="Toggle status"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMeeting(m.id)}
                        className="bg-transparent border-none text-accent-rose cursor-pointer w-9 h-9 flex items-center justify-center"
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
