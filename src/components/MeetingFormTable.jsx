import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MEETING_TYPES, getDefaultFollowUpForMeetingType, calculateFollowUpDate, formatFriendlyDate } from '../utils/followUpRules';
import { Video, Plus, Trash2, CheckCircle2, Clock, X, Grid, List } from 'lucide-react';
import Linkedin from './LinkedinIcon';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

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

  const handleKindChange = (selectedKind) => {
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
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-2">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Video size={22} className="text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Meetings (Goal: 2)</h3>
            </div>
          </div>

          <div className="w-px h-6 bg-border mx-2" />

          {/* Grid/List Layout Toggle */}
          <div className="flex bg-muted p-1 rounded-lg items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className={viewMode === 'grid' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className={viewMode === 'list' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        <Sheet open={showAdd} onOpenChange={setShowAdd}>
          <SheetTrigger render={
            <Button className="gap-2">
              <Plus size={16} />
              <span>{showAdd ? 'Cancel' : 'Add Meeting'}</span>
            </Button>
          } />
          <SheetContent>
            <div className="mx-auto w-full max-w-2xl px-4 pb-8">
              <SheetHeader>
                <SheetTitle>Add Meeting</SheetTitle>
                <SheetDescription>Record a new meeting or interview.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 mt-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                  <div>
                    <label htmlFor="meeting-name-input" className="text-xs text-muted-foreground font-semibold mb-1 block">Meeting Contact / Title *</label>
                    <Input
                      id="meeting-name-input"
                      type="text"
                      placeholder="e.g. Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-org-input" className="text-xs text-muted-foreground font-semibold mb-1 block">Organization</label>
                    <Input
                      id="meeting-org-input"
                      type="text"
                      placeholder="e.g. Acme Inc."
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-emailphone-input" className="text-xs text-muted-foreground font-semibold mb-1 block">Email / Phone</label>
                    <Input
                      id="meeting-emailphone-input"
                      type="text"
                      placeholder="j.smith@acme.com"
                      value={emailPhone}
                      onChange={(e) => setEmailPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-linkedin-input" className="text-xs text-muted-foreground font-semibold mb-1 block">LinkedIn Profile URL</label>
                    <Input
                      id="meeting-linkedin-input"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 items-end">
                  <div>
                    <label htmlFor="meeting-kind-select" className="text-xs text-muted-foreground font-semibold mb-1 block">Kind of Meeting</label>
                    <Select value={kindOfMeeting} onValueChange={handleKindChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEETING_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="meeting-followup-input" className="text-xs text-muted-foreground font-semibold mb-1 block">Follow Up Date</label>
                    <Input
                      id="meeting-followup-input"
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="meeting-comments-input" className="text-xs text-muted-foreground font-semibold mb-1 block">Comments / Agenda</label>
                  <Textarea
                    id="meeting-comments-input"
                    className="min-h-[70px]"
                    placeholder="Key takeaways or agenda items discussed..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border">
                  <SheetClose render={
                    <Button variant="outline" type="button">Cancel</Button>
                  } />
                  <Button type="submit" className="gap-2">
                    <Plus size={16} />
                    <span>Save Meeting</span>
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedMeetings.length > 0 && (
        <div className="flex justify-between items-center bg-destructive/10 border border-destructive/20 p-3.5 px-4.5 rounded-lg mb-2">
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
              id="bulk-select-all-meetings"
            />
            <label htmlFor="bulk-select-all-meetings" className="text-xs font-semibold text-foreground cursor-pointer">
              Select All ({meetings.length})
            </label>
            <span className="text-xs text-muted-foreground">
              • {selectedMeetings.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedMeetings.length} selected meetings?`)) {
                  selectedMeetings.forEach(id => deleteMeeting(id));
                  setSelectedMeetings([]);
                }
              }}
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMeetings([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid/List Wrapper */}
      <div className="flex gap-5 items-start relative w-full max-lg:flex-col max-lg:items-stretch">
        <div className="flex-1 min-w-0">
          {meetings.length === 0 ? (
            <Card className="text-center p-12 text-muted-foreground flex flex-col items-center gap-2.5">
              <Video className="w-11 h-11 text-muted-foreground opacity-50" />
              <p className="text-sm">No meetings logged for today yet. Click "Add Meeting" above.</p>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5" aria-label="Meetings list">
              {meetings.map(m => {
                const isSelected = selectedMeetings.includes(m.id);
                const isActive = activeMeetingId === m.id;

                return (
                  <Card 
                    key={m.id} 
                    className={`flex flex-col gap-3 p-5 relative cursor-pointer transition-all hover:border-primary ${isActive ? 'border-2 border-primary bg-accent/30' : isSelected ? 'border-primary' : ''}`}
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
                          <h4 className="text-base font-bold text-foreground leading-tight">{m.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.organization || 'No Organization'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <Badge variant="secondary">
                          {m.kindOfMeeting}
                        </Badge>
                        <Badge variant={m.status === 'Completed' ? "default" : "outline"}>
                          {m.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t border-border my-1" />

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground mb-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-medium text-foreground">Contact:</span>
                        <span>{m.emailPhone || '—'}</span>
                        {m.linkedinUrl && (
                          <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            <Linkedin size={14} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-border my-1 mt-auto" />

                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Clock size={15} />
                        <span>Follow-up: {formatFriendlyDate(m.followUpDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => { e.stopPropagation(); updateMeeting(m.id, { status: m.status === 'Completed' ? 'Active' : 'Completed' }); }}
                          className={m.status === 'Completed' ? 'text-muted-foreground' : 'text-primary'}
                          title="Toggle status"
                        >
                          <CheckCircle2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {meetings.map(m => {
                const isSelected = selectedMeetings.includes(m.id);
                const isActive = activeMeetingId === m.id;

                return (
                  <Card 
                    key={m.id}
                    className={`flex items-center justify-between p-4 cursor-pointer gap-4 flex-wrap transition-all ${isActive ? 'border-2 border-primary bg-accent/30' : isSelected ? 'border-primary' : ''}`}
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
                        <strong className="text-sm text-foreground font-bold">{m.name}</strong>
                        <div className="text-xs text-muted-foreground">{m.organization || 'No Organization'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant="secondary">{m.kindOfMeeting}</Badge>
                      <Badge variant={m.status === 'Completed' ? "default" : "outline"}>{m.status}</Badge>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ml-2">
                        <Clock size={14} />
                        <span>{formatFriendlyDate(m.followUpDate)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      {/* Inline responsive Side Panel Sheet */}
      {activeMeetingId && (() => {
        const activeMeeting = meetings.find(m => m.id === activeMeetingId);
        if (!activeMeeting) return null;

        return (
          <Card className="w-[400px] shrink-0 flex flex-col sticky top-[100px] h-[calc(100vh-140px)] z-40 overflow-hidden max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-50">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-foreground overflow-hidden text-ellipsis whitespace-nowrap" title={activeMeeting.name}>
                  {activeMeeting.name}
                </h3>
                <div className="text-xs text-muted-foreground font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={activeMeeting.organization}>
                  {activeMeeting.organization || 'No Organization'}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete meeting ${activeMeeting.name}?`)) {
                      deleteMeeting(activeMeeting.id);
                      setActiveMeetingId(null);
                    }
                  }}
                  className="text-destructive hover:bg-destructive/10"
                  title="Delete Meeting"
                >
                  <Trash2 size={16} />
                </Button>
                <Button 
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setActiveMeetingId(null)}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              {/* Metadata Editing Fields */}
              <div className="flex flex-col gap-3.5 p-4 bg-muted/20 rounded-md border border-border">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Meeting Contact / Title</label>
                  <Input 
                    type="text"
                    className="text-xs h-8"
                    value={activeMeeting.name || ''} 
                    onChange={(e) => updateMeeting(activeMeeting.id, { name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Organization</label>
                  <Input 
                    type="text"
                    className="text-xs h-8"
                    value={activeMeeting.organization || ''} 
                    onChange={(e) => updateMeeting(activeMeeting.id, { organization: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Email / Phone</label>
                  <Input 
                    type="text"
                    className="text-xs h-8"
                    value={activeMeeting.emailPhone || ''} 
                    onChange={(e) => updateMeeting(activeMeeting.id, { emailPhone: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">LinkedIn URL</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="url"
                      className="text-xs h-8 flex-1"
                      value={activeMeeting.linkedinUrl || ''} 
                      onChange={(e) => updateMeeting(activeMeeting.id, { linkedinUrl: e.target.value })}
                    />
                    {activeMeeting.linkedinUrl && (
                      <a href={activeMeeting.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Kind of Meeting</label>
                  <Select 
                    className="text-xs h-8"
                    value={activeMeeting.kindOfMeeting || 'Informational Interview'} 
                    onChange={(e) => {
                      const newKind = e.target.value;
                      const autoDays = getDefaultFollowUpForMeetingType(newKind);
                      const newDate = calculateFollowUpDate(autoDays);
                      updateMeeting(activeMeeting.id, { 
                        kindOfMeeting: newKind,
                        followUpDate: newDate
                      });
                    }}
                  >
                    {MEETING_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Comments / Notes</label>
                  <Textarea 
                    className="text-xs min-h-[80px]"
                    value={activeMeeting.comments || ''} 
                    onChange={(e) => updateMeeting(activeMeeting.id, { comments: e.target.value })}
                    placeholder="Record notes..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-muted-foreground uppercase mb-1">Status</label>
                    <Select 
                      className="text-xs h-8"
                      value={activeMeeting.status || 'Active'} 
                      onChange={(e) => updateMeeting(activeMeeting.id, { status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-muted-foreground uppercase mb-1">Follow-up Date</label>
                    <Input 
                      type="date"
                      className="text-xs h-8"
                      value={activeMeeting.followUpDate || ''} 
                      onChange={(e) => updateMeeting(activeMeeting.id, { followUpDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })()}

      </div>
    </div>
  );
}
