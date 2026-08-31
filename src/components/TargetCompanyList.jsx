import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Building2, Plus, Trash2, X, Grid, List, Globe, UserPlus } from 'lucide-react';
import Linkedin from './LinkedinIcon';
import { ContactCombobox } from './ContactCombobox';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function TargetCompanyList() {
  const { targets, addTarget, updateTarget, deleteTarget, allContacts, addContact } = useTracker();
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [companyContacts, setCompanyContacts] = useState('');
  const [notes, setNotes] = useState('');

  // Layout & Selection State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [activeTargetId, setActiveTargetId] = useState(null);
  
  // Contact linking state
  const [addingContactTargetId, setAddingContactTargetId] = useState(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactLinkedin, setNewContactLinkedin] = useState('');

  // Ensure all targets are treated as objects safely
  const safeTargets = targets.map(t => typeof t === 'string' ? { id: t, name: t, website: '', summary: '', contacts: '', notes: '', linkedContactIds: [] } : t);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTarget({
      name,
      website,
      linkedinUrl,
      summary,
      contacts: companyContacts,
      notes,
      linkedContactIds: []
    });

    setName('');
    setWebsite('');
    setLinkedinUrl('');
    setSummary('');
    setCompanyContacts('');
    setNotes('');
    setShowAdd(false);
  };
  
  const handleQuickAddContactSubmit = (e, targetId, targetObj) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newContact = addContact({
      name: newContactName.trim(),
      organization: targetObj.name,
      linkedinUrl: newContactLinkedin.trim(),
      comments: `Contact at target company: ${targetObj.name}`,
      kindOfContact: 'Network Call'
    });

    if (newContact && newContact.id) {
      const currentLinks = targetObj.linkedContactIds || [];
      updateTarget(targetId, {
        linkedContactIds: [...currentLinks, newContact.id]
      });
    }

    setNewContactName('');
    setNewContactLinkedin('');
    setAddingContactTargetId(null);
  };

  const handleLinkContact = (targetId, contactId, targetObj) => {
    const currentLinks = targetObj.linkedContactIds || [];
    if (!currentLinks.includes(contactId)) {
      updateTarget(targetId, { linkedContactIds: [...currentLinks, contactId] });
    }
  };

  const handleUnlinkContact = (targetId, contactId, targetObj) => {
    const currentLinks = targetObj.linkedContactIds || [];
    updateTarget(targetId, { linkedContactIds: currentLinks.filter(id => id !== contactId) });
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-2">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Building2 size={22} className="text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Target Organizations</h3>
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
              <span>{showAdd ? 'Cancel' : 'Add Target'}</span>
            </Button>
          } />
          <SheetContent>
            <div className="mx-auto w-full max-w-2xl px-4 pb-8">
              <SheetHeader>
                <SheetTitle>Add Target Company</SheetTitle>
                <SheetDescription>Create a new target company to track.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 mt-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="target-name-input" className="text-xs font-semibold text-muted-foreground">Company Name *</label>
                    <Input
                      id="target-name-input"
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="target-website-input" className="text-xs font-semibold text-muted-foreground">Website (URL)</label>
                    <Input
                      id="target-website-input"
                      type="url"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="target-linkedin-input" className="text-xs font-semibold text-muted-foreground">LinkedIn Profile URL</label>
                    <Input
                      id="target-linkedin-input"
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="target-summary-input" className="text-xs font-semibold text-muted-foreground">Company Summary / Why them?</label>
                    <Textarea
                      id="target-summary-input"
                      className="min-h-[80px]"
                      placeholder="e.g. Industry leader in XYZ, great culture..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="target-contacts-input" className="text-xs font-semibold text-muted-foreground">Known Contacts (Comma separated)</label>
                    <Textarea
                      id="target-contacts-input"
                      className="min-h-[80px]"
                      placeholder="e.g. Jane Doe (Engineering Manager)"
                      value={companyContacts}
                      onChange={(e) => setCompanyContacts(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="target-notes-input" className="text-xs font-semibold text-muted-foreground">Notes</label>
                    <Textarea
                      id="target-notes-input"
                      className="min-h-[80px]"
                      placeholder="Additional notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border">
                  <SheetClose render={
                    <Button variant="outline" type="button">Cancel</Button>
                  } />
                  <Button type="submit" className="gap-2">
                    <Plus size={16} />
                    <span>Save Target Company</span>
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedTargets.length > 0 && (
        <div className="flex justify-between items-center bg-destructive/10 border border-destructive/20 p-3.5 px-4.5 rounded-lg mb-2">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={selectedTargets.length === safeTargets.length && safeTargets.length > 0}
              onChange={(e) => {
                if (e.target.checked) setSelectedTargets(safeTargets.map(t => t.id));
                else setSelectedTargets([]);
              }}
              className="w-4 h-4 cursor-pointer"
              id="bulk-select-all"
            />
            <label htmlFor="bulk-select-all" className="text-xs font-semibold text-foreground cursor-pointer">
              Select All ({safeTargets.length})
            </label>
            <span className="text-xs text-muted-foreground">
              • {selectedTargets.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedTargets.length} selected companies?`)) {
                  selectedTargets.forEach(id => deleteTarget(id));
                  setSelectedTargets([]);
                }
              }}
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTargets([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid/List Wrapper */}
      <div className="flex gap-5 items-start relative w-full max-lg:flex-col max-lg:items-stretch">
        <div className="flex-1 min-w-0">
          {safeTargets.length === 0 ? (
            <Card className="text-center p-12 text-muted-foreground flex flex-col items-center gap-2.5">
              <Building2 className="w-11 h-11 text-muted-foreground opacity-50" />
              <p className="text-sm">No target companies added yet. Click "Add Target" above.</p>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5" aria-label="Target companies grid">
              {safeTargets.map(t => {
                const isSelected = selectedTargets.includes(t.id);
                const isActive = activeTargetId === t.id;

                return (
                  <Card 
                    key={t.id} 
                    className={`flex flex-col gap-3 p-5 relative cursor-pointer transition-all hover:border-primary ${isActive ? 'border-2 border-primary bg-accent/30' : isSelected ? 'border-primary' : ''}`}
                    onClick={() => setActiveTargetId(t.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTargets(prev => [...prev, t.id]);
                            else setSelectedTargets(prev => prev.filter(id => id !== t.id));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <h4 className="text-base font-bold text-foreground leading-tight">{t.name}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border my-1" />

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground line-clamp-2">{(t.summary && t.summary.trim()) ? t.summary : 'No summary added'}</span>
                      </div>
                      
                      {t.website && (
                        <div className="mt-2">
                           <a href={t.website.startsWith('http') ? t.website : `https://${t.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                             <Globe size={14} />
                             <span>Website</span>
                           </a>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {safeTargets.map(t => {
                const isSelected = selectedTargets.includes(t.id);
                const isActive = activeTargetId === t.id;

                return (
                  <Card 
                    key={t.id}
                    className={`flex items-center justify-between p-4 cursor-pointer gap-4 flex-wrap transition-all ${isActive ? 'border-2 border-primary bg-accent/30' : isSelected ? 'border-primary' : ''}`}
                    onClick={() => setActiveTargetId(t.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-[250px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTargets(prev => [...prev, t.id]);
                          else setSelectedTargets(prev => prev.filter(id => id !== t.id));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      
                      <div>
                        <strong className="text-sm text-foreground font-bold">{t.name}</strong>
                        <div className="text-xs text-muted-foreground truncate max-w-sm">{(t.summary && t.summary.trim()) ? t.summary : 'No summary added'}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      {/* Inline responsive Side Panel Sheet */}
      {activeTargetId && (() => {
        const activeTarget = safeTargets.find(t => t.id === activeTargetId);
        if (!activeTarget) return null;
        
        const linkedContacts = (allContacts || []).filter(c => (activeTarget.linkedContactIds || []).includes(c.id));
        const availableContacts = (allContacts || []).filter(c => !(activeTarget.linkedContactIds || []).includes(c.id));

        return (
          <Card className="w-[400px] shrink-0 flex flex-col sticky top-[100px] h-[calc(100vh-140px)] z-40 overflow-hidden max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-50">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30 gap-2">
              <div className="flex-1 min-w-0">
                <Input 
                  type="text"
                  className="font-extrabold text-base h-8"
                  value={activeTarget.name || ''}
                  onChange={(e) => updateTarget(activeTarget.id, { name: e.target.value })}
                  placeholder="Company Name"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${activeTarget.name}?`)) {
                      deleteTarget(activeTarget.id);
                      setActiveTargetId(null);
                    }
                  }}
                  className="text-destructive hover:bg-destructive/10"
                  title="Delete Target"
                >
                  <Trash2 size={16} />
                </Button>
                <Button 
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setActiveTargetId(null)}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Website</label>
                <Input 
                  type="text"
                  value={activeTarget.website || ''}
                  onChange={(e) => updateTarget(activeTarget.id, { website: e.target.value })}
                  placeholder="e.g. https://company.com"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Summary</label>
                <Textarea 
                  className="text-xs min-h-[100px]"
                  value={activeTarget.summary || ''} 
                  onChange={(e) => updateTarget(activeTarget.id, { summary: e.target.value })}
                  placeholder="What does this company do? Why target them?"
                />
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[0.7rem] font-bold text-muted-foreground uppercase">Target Contacts</span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setAddingContactTargetId(addingContactTargetId === activeTarget.id ? null : activeTarget.id)}
                    className="gap-1"
                  >
                    <UserPlus size={12} />
                    <span>{addingContactTargetId === activeTarget.id ? 'Close' : 'Quick Add'}</span>
                  </Button>
                </div>

                {addingContactTargetId === activeTarget.id && (
                  <form 
                    onSubmit={(e) => handleQuickAddContactSubmit(e, activeTarget.id, activeTarget)} 
                    className="flex flex-col gap-1.5 bg-muted/30 p-2.5 rounded-md mb-2 border border-border"
                  >
                    <Input 
                      type="text" 
                      placeholder="Contact name (required)..." 
                      className="text-xs h-8"
                      value={newContactName} 
                      onChange={(e) => setNewContactName(e.target.value)} 
                      required 
                    />
                    <Input 
                      type="url" 
                      placeholder="LinkedIn URL (optional)..." 
                      className="text-xs h-8"
                      value={newContactLinkedin} 
                      onChange={(e) => setNewContactLinkedin(e.target.value)} 
                    />
                    <Button type="submit" size="xs" className="self-end">
                      Add & Link
                    </Button>
                  </form>
                )}

                {linkedContacts.length > 0 && (
                  <div className="flex flex-col gap-1.5 my-2">
                    {linkedContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex items-center justify-between p-2 bg-muted/20 rounded-md border border-border"
                      >
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs text-foreground font-bold">{contact.name}</strong>
                          {contact.linkedinUrl && (
                            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <Linkedin size={10} className="text-primary" />
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleUnlinkContact(activeTarget.id, contact.id, activeTarget)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Unlink contact"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {availableContacts.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <ContactCombobox
                      contacts={availableContacts}
                      onSelect={(contactId) => {
                        handleLinkContact(activeTarget.id, contactId, activeTarget);
                      }}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Contact Notes</label>
                <Textarea 
                  className="text-xs min-h-[80px]"
                  value={activeTarget.contacts || ''} 
                  onChange={(e) => updateTarget(activeTarget.id, { contacts: e.target.value })}
                  placeholder="Additional contact notes..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-muted-foreground uppercase">Notes</label>
                <Textarea 
                  className="text-xs min-h-[100px]"
                  value={activeTarget.notes || ''} 
                  onChange={(e) => updateTarget(activeTarget.id, { notes: e.target.value })}
                  placeholder="Any other notes..."
                />
              </div>
            </div>
          </Card>
        );
      })()}

      </div>
    </div>
  );
}
