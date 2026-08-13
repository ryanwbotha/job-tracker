import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Building2, Plus, Trash2, X, Grid, List, Globe } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_AMBER = `${BTN_BASE} border-amber-600 bg-amber-600 px-5 py-2.5 text-white hover:bg-amber-700 focus-visible:ring-amber-200`;
const BTN_SM_AMBER = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-amber text-white hover:bg-amber-700`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-amber focus:ring-4 focus:ring-amber-500/10";
const LINK_CLASS = "inline-flex items-center gap-1 text-sm text-indigo-600 font-medium underline-offset-2 hover:underline hover:text-indigo-700";

export default function TargetCompanyList() {
  const { targets, addTarget, updateTarget, deleteTarget } = useTracker();
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [summary, setSummary] = useState('');
  const [companyContacts, setCompanyContacts] = useState('');
  const [notes, setNotes] = useState('');

  // Layout & Selection State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [activeTargetId, setActiveTargetId] = useState(null);

  // Ensure all targets are treated as objects safely
  const safeTargets = targets.map(t => typeof t === 'string' ? { id: t, name: t, website: '', summary: '', contacts: '', notes: '' } : t);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTarget({
      name,
      website,
      summary,
      contacts: companyContacts,
      notes
    });

    setName('');
    setWebsite('');
    setSummary('');
    setCompanyContacts('');
    setNotes('');
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-5">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Building2 size={22} color="var(--accent-amber)" />
            <div>
              <h3 className="text-[1.1rem] font-bold text-text-primary">Target Organizations</h3>
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

        <button className={BTN_SM_AMBER} onClick={() => setShowAdd(!showAdd)} aria-label={showAdd ? 'Cancel adding target' : 'Add new target'}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Target'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-amber-500/5 p-5 rounded-md mb-5 border border-amber-500/20 flex flex-col gap-4 animate-slide-down-fade">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <div>
              <label htmlFor="target-name-input" className="text-[0.85rem] text-text-secondary font-semibold">Company Name *</label>
              <input
                id="target-name-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="target-website-input" className="text-[0.85rem] text-text-secondary font-semibold">Website</label>
              <input
                id="target-website-input"
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. https://acme.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 items-start">
            <div>
              <label htmlFor="target-summary-input" className="text-[0.85rem] text-text-secondary font-semibold">Summary</label>
              <textarea
                id="target-summary-input"
                className={`${INPUT_FIELD} min-h-[80px] resize-y`}
                placeholder="What does this company do?"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="target-contacts-input" className="text-[0.85rem] text-text-secondary font-semibold">Known Contacts</label>
              <textarea
                id="target-contacts-input"
                className={`${INPUT_FIELD} min-h-[80px] resize-y`}
                placeholder="List known contacts here..."
                value={companyContacts}
                onChange={(e) => setCompanyContacts(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="target-notes-input" className="text-[0.85rem] text-text-secondary font-semibold">Notes</label>
              <textarea
                id="target-notes-input"
                className={`${INPUT_FIELD} min-h-[80px] resize-y`}
                placeholder="Additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button type="submit" className={BTN_AMBER} aria-label="Save target company">Save Target Company</button>
          </div>
        </form>
      )}

      {/* Bulk Action Toolbar */}
      {selectedTargets.length > 0 && (
        <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/15 p-3.5 px-4.5 rounded-lg animate-fadeIn mb-5">
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
            <label htmlFor="bulk-select-all" className="text-[0.85rem] font-semibold text-text-primary cursor-pointer">
              Select All ({safeTargets.length})
            </label>
            <span className="text-[0.85rem] text-text-secondary">
              • {selectedTargets.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedTargets.length} selected companies?`)) {
                  selectedTargets.forEach(id => deleteTarget(id));
                  setSelectedTargets([]);
                }
              }}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-rose text-white hover:bg-rose-700 text-xs"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedTargets([])}
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
          {safeTargets.length === 0 ? (
            <div className="bg-bg-card border border-border-color rounded-lg shadow-card text-center p-[3.5rem_1.5rem] text-text-muted flex flex-col items-center gap-2.5">
              <Building2 className="w-11 h-11 text-text-muted opacity-50" />
              <p>No target companies added yet. Click "Add Target" above.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5" aria-label="Target companies grid">
              {safeTargets.map(t => {
                const isSelected = selectedTargets.includes(t.id);
                const isActive = activeTargetId === t.id;

                return (
                  <div 
                    key={t.id} 
                    className={`flex flex-col gap-3 p-5 relative rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md ${isActive ? 'border-2 border-accent-amber bg-amber-500/5' : isSelected ? 'border border-accent-amber bg-amber-500/5' : 'border border-border-color bg-bg-card hover:border-accent-amber'}`}
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
                          <h4 className="text-[1.1rem] font-bold text-text-primary leading-tight">{t.name}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-color/50 my-1"></div>

                    <div className="flex flex-col gap-2 text-[0.85rem] text-text-secondary mb-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-text-primary line-clamp-2">{(t.summary && t.summary.trim()) ? t.summary : 'No summary added'}</span>
                      </div>
                      
                      {t.website && (
                        <div className="mt-2">
                           <a href={t.website.startsWith('http') ? t.website : `https://${t.website}`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} onClick={(e) => e.stopPropagation()}>
                             <Globe size={14} />
                             <span>Website</span>
                           </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {safeTargets.map(t => {
                const isSelected = selectedTargets.includes(t.id);
                const isActive = activeTargetId === t.id;

                return (
                  <div 
                    key={t.id}
                    className={`flex items-center justify-between p-[0.85rem_1.25rem] rounded-lg cursor-pointer gap-4 flex-wrap transition-all duration-150 ${isActive ? 'border-2 border-accent-amber bg-amber-500/5' : isSelected ? 'border border-accent-amber bg-amber-500/5' : 'border border-border-color bg-bg-card hover:border-accent-amber'}`}
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
                        <strong className="text-[1rem] text-text-primary font-bold">{t.name}</strong>
                        <div className="text-[0.8rem] text-text-secondary truncate max-w-sm">{(t.summary && t.summary.trim()) ? t.summary : 'No summary added'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Responsive Side Drawer Spacer to shift listings */}
        {activeTargetId && (
          <div className="w-[400px] shrink-0 max-lg:hidden transition-all duration-300" />
        )}
      </div>

      {/* Inline responsive Side Panel Drawer */}
      {activeTargetId && (() => {
        const activeTarget = safeTargets.find(t => t.id === activeTargetId);
        if (!activeTarget) return null;

        return (
          <div className="w-[400px] shrink-0 bg-bg-card border border-border-color rounded-lg shadow-card flex flex-col fixed top-[100px] right-8 bottom-8 z-[100] overflow-hidden animate-slide-in-right max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-[9999]">
            {/* Header */}
            <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-elevated gap-2">
              <div className="flex-1 min-w-0">
                <input 
                  type="text"
                  className={`${INPUT_FIELD} font-extrabold text-[1.1rem] py-1 px-2 -ml-2`}
                  value={activeTarget.name || ''}
                  onChange={(e) => updateTarget(activeTarget.id, { name: e.target.value })}
                  placeholder="Company Name"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${activeTarget.name}?`)) {
                      deleteTarget(activeTarget.id);
                      setActiveTargetId(null);
                    }
                  }}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                  title="Delete Target"
                >
                  <Trash2 size={16} color="var(--accent-rose)" />
                </button>
                <button 
                  onClick={() => setActiveTargetId(null)}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Website</label>
                <input 
                  type="text"
                  className={INPUT_FIELD}
                  value={activeTarget.website || ''}
                  onChange={(e) => updateTarget(activeTarget.id, { website: e.target.value })}
                  placeholder="e.g. https://company.com"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Summary</label>
                <textarea 
                  className={`${INPUT_FIELD} text-[0.8rem] min-h-[100px] p-[0.55rem] resize-y`}
                  value={activeTarget.summary || ''} 
                  onChange={(e) => updateTarget(activeTarget.id, { summary: e.target.value })}
                  placeholder="What does this company do? Why target them?"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Contacts</label>
                <textarea 
                  className={`${INPUT_FIELD} text-[0.8rem] min-h-[100px] p-[0.55rem] resize-y`}
                  value={activeTarget.contacts || ''} 
                  onChange={(e) => updateTarget(activeTarget.id, { contacts: e.target.value })}
                  placeholder="List people you know or need to talk to here..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Notes</label>
                <textarea 
                  className={`${INPUT_FIELD} text-[0.8rem] min-h-[100px] p-[0.55rem] resize-y`}
                  value={activeTarget.notes || ''} 
                  onChange={(e) => updateTarget(activeTarget.id, { notes: e.target.value })}
                  placeholder="Any other notes..."
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
