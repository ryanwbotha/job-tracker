import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MEETING_TYPES, getDefaultFollowUpForMeetingType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Video, Plus, Trash2, CheckCircle2, Clock, X, Grid, List } from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PURPLE = `${BTN_BASE} border-violet-600 bg-violet-600 px-5 py-2.5 text-white hover:bg-violet-700 focus-visible:ring-violet-200`;
const BTN_SM_PURPLE = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-purple text-white hover:bg-purple-700`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
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

  // Layout & Selection State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [activeMeetingId, setActiveMeetingId] = useState(null);

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
    <div className="flex flex-col gap-5">
      
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-5">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Video size={22} color="var(--accent-purple)" />
            <div>
              <h3 className="text-[1.1rem] font-bold text-text-primary">Face-to-Face Meetings (Goal: 2)</h3>
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

        <button className={BTN_SM_PURPLE} onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Cancel adding meeting' : 'Add new meeting'}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Meeting'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-md border border-border-color flex flex-col gap-4 animate-slide-down-fade">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div>
              <label htmlFor="meeting-name-input" className="text-[0.85rem] text-text-secondary font-semibold">Contact / Interviewer Name *</label>
              <input
                id="meeting-name-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. John Doe"
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
                placeholder="e.g. TechCorp"
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
                placeholder="j.doe@techcorp.com"
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

      {/* Bulk Action Toolbar */}
      {selectedMeetings.length > 0 && (
        <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/15 p-3.5 px-4.5 rounded-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={selectedMeetings.length === meetings.length && meetings.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMeetings(meetings.map(m => m.id));
                } else {
                  setSelectedMeetings([]);
                }
              }}
              className="w-4 h-4 cursor-pointer"
              id="bulk-select-all"
            />
            <label htmlFor="bulk-select-all" className="text-[0.85rem] font-semibold text-text-primary cursor-pointer">
              Select All ({meetings.length})
            </label>
            <span className="text-[0.85rem] text-text-secondary">
              • {selectedMeetings.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedMeetings.length} selected meetings?`)) {
                  selectedMeetings.forEach(id => deleteMeeting(id));
                  setSelectedMeetings([]);
                }
              }}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-rose text-white hover:bg-rose-700 text-xs"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedMeetings([])}
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
          {meetings.length === 0 ? (
            <div className="bg-bg-card border border-border-color rounded-lg shadow-card text-center p-[3.5rem_1.5rem] text-text-muted flex flex-col items-center gap-2.5">
              <Video className="w-11 h-11 text-text-muted opacity-50" />
              <p>No face-to-face meetings scheduled for today. Click "Add Meeting" above.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5" aria-label="Meetings list">
              {meetings.map(m => {
                const isSelected = selectedMeetings.includes(m.id);
                const isActive = activeMeetingId === m.id;

                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col gap-3 p-5 relative rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md ${isActive ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                    onClick={() => setActiveMeetingId(m.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMeetings(prev => [...prev, m.id]);
                            else setSelectedMeetings(prev => prev.filter(id => id !== m.id));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <h4 className="text-[1.15rem] font-extrabold font-heading text-text-primary">{m.name}</h4>
                          <p className="text-[0.85rem] text-text-secondary font-semibold mt-0.5">{m.organization || 'No Organization'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <span className={`${BADGE_BASE} bg-accent-purple/8 text-accent-purple`}>
                          {m.kindOfMeeting}
                        </span>
                        <span className={`${BADGE_BASE} ${m.status === 'Completed' ? 'bg-accent-blue/8 text-accent-blue' : 'bg-accent-amber/8 text-amber-700'}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border-color/50 my-1"></div>

                    <div className="flex flex-col gap-2 text-[0.85rem] text-text-secondary mb-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-medium text-text-primary">Contact:</span>
                        <span>{m.emailPhone || '—'}</span>
                        {m.linkedinUrl && (
                          <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} onClick={(e) => e.stopPropagation()}>
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
                        <span>Follow-up: {formatFriendlyDate(m.followUpDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateMeeting(m.id, { status: m.status === 'Completed' ? 'Upcoming' : 'Completed' }); }}
                          className={`border border-border-color rounded-lg p-2 flex items-center justify-center transition-colors cursor-pointer hover:bg-bg-elevated ${m.status === 'Completed' ? 'text-text-muted' : 'text-accent-purple'}`}
                          aria-label={`Toggle status for meeting ${m.name}`}
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
              {meetings.map(m => {
                const isSelected = selectedMeetings.includes(m.id);
                const isActive = activeMeetingId === m.id;

                return (
                  <div 
                    key={m.id}
                    className={`flex items-center justify-between p-[0.85rem_1.25rem] rounded-lg cursor-pointer gap-4 flex-wrap transition-all duration-150 ${isActive ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                    onClick={() => setActiveMeetingId(m.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-[250px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMeetings(prev => [...prev, m.id]);
                          else setSelectedMeetings(prev => prev.filter(id => id !== m.id));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      
                      <div>
                        <strong className="text-[1rem] text-text-primary font-bold">{m.name}</strong>
                        <div className="text-[0.8rem] text-text-secondary">{m.organization || 'No Organization'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`${BADGE_BASE} bg-accent-purple/8 text-accent-purple`}>{m.kindOfMeeting}</span>
                      <span className={`${BADGE_BASE} ${m.status === 'Completed' ? 'bg-accent-blue/8 text-accent-blue' : 'bg-accent-amber/8 text-amber-700'}`}>{m.status}</span>
                      <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-amber-700 ml-2">
                        <Clock size={14} />
                        <span>{formatFriendlyDate(m.followUpDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Responsive Side Drawer Spacer to shift listings */}
        {activeMeetingId && (
          <div className="w-[400px] shrink-0 max-lg:hidden transition-all duration-300" />
        )}
      </div>

      {/* Inline responsive Side Panel Drawer */}
      {activeMeetingId && (() => {
        const activeMeeting = meetings.find(m => m.id === activeMeetingId);
        if (!activeMeeting) return null;

        return (
          <div className="w-[400px] shrink-0 bg-bg-card border border-border-color rounded-lg shadow-card flex flex-col fixed top-[100px] right-8 bottom-8 z-[100] overflow-hidden animate-slide-in-right max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-[9999]">
            {/* Header */}
            <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-elevated gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-[1.1rem] font-extrabold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={activeMeeting.name}>
                  {activeMeeting.name}
                </h3>
                <div className="text-[0.85rem] text-text-secondary font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={activeMeeting.organization}>
                  {activeMeeting.organization || 'No Organization'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete meeting with ${activeMeeting.name}?`)) {
                      deleteMeeting(activeMeeting.id);
                      setActiveMeetingId(null);
                    }
                  }}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                  title="Delete Meeting"
                >
                  <Trash2 size={16} color="var(--accent-rose)" />
                </button>
                <button 
                  onClick={() => setActiveMeetingId(null)}
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
                  <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Meeting Results / Comments</label>
                  <textarea 
                    className={`${INPUT_FIELD} text-[0.8rem] min-h-[80px] p-[0.55rem] resize-y`}
                    value={activeMeeting.comments || ''} 
                    onChange={(e) => updateMeeting(activeMeeting.id, { comments: e.target.value })}
                    placeholder="Key takeaways, thank-you follow-up items..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Status</label>
                    <select 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
                      value={activeMeeting.status || 'Upcoming'} 
                      onChange={(e) => updateMeeting(activeMeeting.id, { status: e.target.value })}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Follow-up Date</label>
                    <input 
                      type="date"
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
                      value={activeMeeting.followUpDate || ''} 
                      onChange={(e) => updateMeeting(activeMeeting.id, { followUpDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border-color"></div>
              
              <div className="flex flex-col gap-2.5">
                <h4 className="text-[0.85rem] font-bold text-text-primary">Meeting Details</h4>
                <div className="flex flex-col gap-2">
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Email/Phone:</span>
                    <span className="text-text-primary">{activeMeeting.emailPhone || '—'}</span>
                  </div>
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Type:</span>
                    <span className="text-text-primary">{activeMeeting.kindOfMeeting}</span>
                  </div>
                  {activeMeeting.linkedinUrl && (
                    <div className="text-[0.85rem]">
                      <span className="text-text-muted font-medium w-24 inline-block">LinkedIn:</span>
                      <a href={activeMeeting.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>View Profile</a>
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
