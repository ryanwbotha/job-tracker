import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CONTACT_TYPES, getDefaultFollowUpForContactType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Users, Plus, Trash2, CheckCircle2, Clock, X, Grid, List } from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_EMERALD = `${BTN_BASE} border-emerald-600 bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200`;
const BTN_SM_EMERALD = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-emerald text-white hover:bg-emerald-700`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
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

  // Layout & Selection State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);

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
    <div className="flex flex-col gap-5">
      
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-5">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Users size={22} color="var(--accent-emerald)" />
            <div>
              <h3 className="text-[1.1rem] font-bold text-text-primary">Contacts Made (Goal: 10)</h3>
            </div>
          </div>

          <div className="w-px h-6 bg-border-color mx-2" />

          {/* Grid/List Layout Toggle */}
          <div className="flex bg-black/3 p-0.5 rounded-lg border border-border-color items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`border-none p-1.5 rounded-[6px] cursor-pointer flex items-center transition-all duration-150 ${
                viewMode === 'grid' ? 'bg-bg-card text-accent-blue shadow-sm' : 'bg-transparent text-text-secondary'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`border-none p-1.5 rounded-[6px] cursor-pointer flex items-center transition-all duration-150 ${
                viewMode === 'list' ? 'bg-bg-card text-accent-blue shadow-sm' : 'bg-transparent text-text-secondary'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
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
                placeholder="e.g. John Doe"
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
                placeholder="e.g. TechCorp"
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
                placeholder="j.doe@techcorp.com"
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

      {/* Bulk Action Toolbar */}
      {selectedContacts.length > 0 && (
        <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/15 p-3.5 px-4.5 rounded-lg animate-fadeIn mb-5">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={selectedContacts.length === contacts.length && contacts.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedContacts(contacts.map(c => c.id));
                } else {
                  setSelectedContacts([]);
                }
              }}
              className="w-4 h-4 cursor-pointer"
              id="bulk-select-all"
            />
            <label htmlFor="bulk-select-all" className="text-[0.85rem] font-semibold text-text-primary cursor-pointer">
              Select All ({contacts.length})
            </label>
            <span className="text-[0.85rem] text-text-secondary">
              • {selectedContacts.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedContacts.length} selected contacts?`)) {
                  selectedContacts.forEach(id => deleteContact(id));
                  setSelectedContacts([]);
                }
              }}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-rose text-white hover:bg-rose-700 text-xs"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedContacts([])}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated text-xs"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid/List Wrapper */}
      <div className="flex gap-5 items-start relative w-full max-lg:flex-col max-lg:items-stretch">
        <div className="flex-1 min-w-0">
          {contacts.length === 0 ? (
            <div className="bg-bg-card border border-border-color rounded-lg shadow-card text-center p-[3.5rem_1.5rem] text-text-muted flex flex-col items-center gap-2.5">
              <Users className="w-11 h-11 text-text-muted opacity-50" />
              <p>No contacts logged for today yet. Click "Add Contact" above.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5" aria-label="Contacts list">
              {contacts.map(c => {
                const isSelected = selectedContacts.includes(c.id);
                const isActive = activeContactId === c.id;

                return (
                  <div 
                    key={c.id} 
                    className={`flex flex-col gap-3 p-5 relative rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md ${isActive ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                    onClick={() => setActiveContactId(c.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedContacts(prev => [...prev, c.id]);
                            else setSelectedContacts(prev => prev.filter(id => id !== c.id));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <h4 className="text-[1.1rem] font-bold text-text-primary leading-tight">{c.name}</h4>
                          <p className="text-[0.8rem] text-text-secondary mt-0.5">{c.organization || 'No Organization'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`}>
                          {c.kindOfContact}
                        </span>
                        <span className={`${BADGE_BASE} ${c.status === 'Completed' ? 'bg-accent-blue/8 text-accent-blue' : 'bg-accent-amber/8 text-amber-700'}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border-color/50 my-1"></div>

                    <div className="flex flex-col gap-2 text-[0.85rem] text-text-secondary mb-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-medium text-text-primary">Contact:</span>
                        <span>{c.emailPhone || '—'}</span>
                        {c.linkedinUrl && (
                          <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} onClick={(e) => e.stopPropagation()}>
                            <Linkedin size={14} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-border-color/50 my-1 mt-auto"></div>

                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-amber-700">
                        <Clock size={15} />
                        <span>Follow-up: {formatFriendlyDate(c.followUpDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateContact(c.id, { status: c.status === 'Completed' ? 'Active' : 'Completed' }); }}
                          className={`border border-border-color rounded-lg p-2 flex items-center justify-center transition-colors cursor-pointer hover:bg-bg-elevated ${c.status === 'Completed' ? 'text-text-muted' : 'text-accent-emerald'}`}
                          aria-label={`Toggle status for contact ${c.name}`}
                          title="Toggle status"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {contacts.map(c => {
                const isSelected = selectedContacts.includes(c.id);
                const isActive = activeContactId === c.id;

                return (
                  <div 
                    key={c.id}
                    className={`flex items-center justify-between p-[0.85rem_1.25rem] rounded-lg cursor-pointer gap-4 flex-wrap transition-all duration-150 ${isActive ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                    onClick={() => setActiveContactId(c.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-[250px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedContacts(prev => [...prev, c.id]);
                          else setSelectedContacts(prev => prev.filter(id => id !== c.id));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      
                      <div>
                        <strong className="text-[1rem] text-text-primary font-bold">{c.name}</strong>
                        <div className="text-[0.8rem] text-text-secondary">{c.organization || 'No Organization'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`}>{c.kindOfContact}</span>
                      <span className={`${BADGE_BASE} ${c.status === 'Completed' ? 'bg-accent-blue/8 text-accent-blue' : 'bg-accent-amber/8 text-amber-700'}`}>{c.status}</span>
                      <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-amber-700 ml-2">
                        <Clock size={14} />
                        <span>{formatFriendlyDate(c.followUpDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Responsive Side Drawer Spacer to shift listings */}
        {activeContactId && (
          <div className="w-[400px] shrink-0 max-lg:hidden transition-all duration-300" />
        )}
      </div>

      {/* Inline responsive Side Panel Drawer */}
      {activeContactId && (() => {
        const activeContact = contacts.find(c => c.id === activeContactId);
        if (!activeContact) return null;

        return (
          <div className="w-[400px] shrink-0 bg-bg-card border border-border-color rounded-lg shadow-card flex flex-col fixed top-[100px] right-8 bottom-8 z-[100] overflow-hidden animate-slide-in-right max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-[9999]">
            {/* Header */}
            <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-elevated gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-[1.1rem] font-extrabold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={activeContact.name}>
                  {activeContact.name}
                </h3>
                <div className="text-[0.85rem] text-text-secondary font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={activeContact.organization}>
                  {activeContact.organization || 'No Organization'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete contact ${activeContact.name}?`)) {
                      deleteContact(activeContact.id);
                      setActiveContactId(null);
                    }
                  }}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                  title="Delete Contact"
                >
                  <Trash2 size={16} color="var(--accent-rose)" />
                </button>
                <button 
                  onClick={() => setActiveContactId(null)}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              {/* Metadata Editing Fields */}
              <div className="flex flex-col gap-3.5 p-4 bg-slate-50 rounded-md border border-border-color">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Comments / Next Steps</label>
                  <textarea 
                    className={`${INPUT_FIELD} text-[0.8rem] min-h-[80px] p-[0.55rem] resize-y`}
                    value={activeContact.comments || ''} 
                    onChange={(e) => updateContact(activeContact.id, { comments: e.target.value })}
                    placeholder="Record results, follow-up notes..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Status</label>
                    <select 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
                      value={activeContact.status || 'Active'} 
                      onChange={(e) => updateContact(activeContact.id, { status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Follow-up Date</label>
                    <input 
                      type="date"
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
                      value={activeContact.followUpDate || ''} 
                      onChange={(e) => updateContact(activeContact.id, { followUpDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border-color"></div>
              
              <div className="flex flex-col gap-2.5">
                <h4 className="text-[0.85rem] font-bold text-text-primary">Contact Details</h4>
                <div className="flex flex-col gap-2">
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Email/Phone:</span>
                    <span className="text-text-primary">{activeContact.emailPhone || '—'}</span>
                  </div>
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Type:</span>
                    <span className="text-text-primary">{activeContact.kindOfContact}</span>
                  </div>
                  {activeContact.linkedinUrl && (
                    <div className="text-[0.85rem]">
                      <span className="text-text-muted font-medium w-24 inline-block">LinkedIn:</span>
                      <a href={activeContact.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>View Profile</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
