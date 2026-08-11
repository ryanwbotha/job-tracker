import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CONTACT_TYPES, getDefaultFollowUpForContactType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Users, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_EMERALD = `${BTN_BASE} border-emerald-600 bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200`;
const BTN_SM_EMERALD = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-emerald text-white hover:bg-emerald-700`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const TH_CLASS = "px-3 py-2 text-left text-sm font-medium text-gray-900 whitespace-nowrap";
const TD_CLASS = "px-3 py-2 text-sm text-gray-700 whitespace-nowrap";
const LINK_CLASS = "inline-flex items-center gap-1 text-sm text-indigo-600 font-medium underline-offset-2 hover:underline hover:text-indigo-700";

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
    <div className="section-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Users size={22} color="var(--accent-emerald)" />
          <div>
            <h3 className="text-[1.1rem] font-bold text-text-primary">Contacts Made (Goal: 10)</h3>
            <p className="text-[0.85rem] text-text-secondary">
              Reach out daily. Automatic follow-up scheduled based on contact preset type.
            </p>
          </div>
        </div>

        <button className={BTN_SM_EMERALD} onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Cancel adding contact' : 'Add new contact'}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Contact'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-md mb-5 border border-border-color flex flex-col gap-4 animate-slide-down-fade">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div>
              <label htmlFor="contact-name-input" className="text-[0.85rem] text-text-secondary font-semibold">Contact Name *</label>
              <input
                id="contact-name-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Dave North"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-org-input" className="text-[0.85rem] text-text-secondary font-semibold">Organization</label>
              <input
                id="contact-org-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Ancestry.com"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-emailphone-input" className="text-[0.85rem] text-text-secondary font-semibold">Email / Phone</label>
              <input
                id="contact-emailphone-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="d.north@ancestry.com"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-linkedin-input" className="text-[0.85rem] text-text-secondary font-semibold">LinkedIn Profile URL</label>
              <input
                id="contact-linkedin-input"
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
              <label htmlFor="contact-kind-select" className="text-[0.85rem] text-text-secondary font-semibold">Kind of Contact (Preset)</label>
              <select id="contact-kind-select" className={INPUT_FIELD} value={kindOfContact} onChange={handleKindChange}>
                {CONTACT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contact-followup-input" className="text-[0.85rem] text-text-secondary font-semibold">Auto Follow-up Date</label>
              <input
                id="contact-followup-input"
                type="date"
                className={INPUT_FIELD}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-comments-input" className="text-[0.85rem] text-text-secondary font-semibold">Comments / Next Steps</label>
              <input
                id="contact-comments-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="Record results, follow-up notes"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className={`${BTN_EMERALD} w-full`} aria-label="Save contact">Save Contact</button>
            </div>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-10 px-5 text-text-muted flex flex-col items-center gap-2.5">
          <Users className="w-11 h-11 text-text-muted opacity-50" />
          <p>No contacts logged for today yet. Click "Add Contact" above.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-0" aria-label="Contacts list table">
            <thead>
              <tr>
                <th className={TH_CLASS}>Contact Name</th>
                <th className={TH_CLASS}>Organization</th>
                <th className={TH_CLASS}>Email / Phone / LinkedIn</th>
                <th className={TH_CLASS}>Kind of Contact</th>
                <th className={TH_CLASS}>Comments</th>
                <th className={TH_CLASS}>Follow-up Date</th>
                <th className={TH_CLASS}>Status</th>
                <th className={`${TH_CLASS} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="group">
                  <td className={`${TD_CLASS} font-semibold`}>
                    {c.name}
                  </td>
                  <td className={TD_CLASS}>{c.organization || '—'}</td>
                  <td className={TD_CLASS}>
                    <div className="flex flex-col gap-1 text-[16px]">
                      <span>{c.emailPhone || '—'}</span>
                      {c.linkedinUrl && (
                        <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                          <Linkedin size={14} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className={TD_CLASS}>
                    <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`}>{c.kindOfContact}</span>
                  </td>
                  <td className={`${TD_CLASS} text-text-secondary text-[16px] max-w-[280px] break-words`}>{c.comments || '—'}</td>
                  <td className={TD_CLASS}>
                    <div className="flex items-center gap-1.5 text-[16px] font-semibold text-amber-700">
                      <Clock size={14} />
                      <span>{formatFriendlyDate(c.followUpDate)}</span>
                    </div>
                  </td>
                  <td className={TD_CLASS}>
                    <span className={`${BADGE_BASE} ${c.status === 'Completed' ? 'bg-accent-blue/8 text-accent-blue' : 'bg-accent-amber/8 text-amber-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} text-right`}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => updateContact(c.id, { status: c.status === 'Completed' ? 'Active' : 'Completed' })}
                        className={`bg-transparent border-none cursor-pointer w-9 h-9 flex items-center justify-center ${c.status === 'Completed' ? 'text-text-muted' : 'text-accent-emerald'}`}
                        aria-label={`Toggle status for contact ${c.name}`}
                        title="Toggle status"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="bg-transparent border-none text-accent-rose cursor-pointer w-9 h-9 flex items-center justify-center"
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
