import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Compass, Plus, Trash2, BookOpen, ExternalLink, Star, User, X, ArrowUpDown, ArrowUp, ArrowDown, Search, Grid, List } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PRIMARY = `${BTN_BASE} border-indigo-600 bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200`;
const BTN_SECONDARY = `${BTN_BASE} border-border-color bg-bg-card px-5 py-2.5 text-text-primary hover:bg-bg-elevated focus-visible:ring-slate-200`;
const BTN_SM_PRIMARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-blue text-white hover:bg-blue-700`;
const BTN_SM_SECONDARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const LINK_CLASS = "inline-flex items-center gap-1 text-sm text-indigo-600 font-medium underline-offset-2 hover:underline hover:text-indigo-700";
const CLOSE_BTN = "inline-flex items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer border-none bg-transparent";

export default function ResourceTracker() {
  const { resources, addResource, deleteResource, updateResource, allContacts } = useTracker();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Company Directory');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('To Explore');
  const [contactPerson, setContactPerson] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  
  // Layout & Selection State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedResources, setSelectedResources] = useState([]);
  const [activeResourceId, setActiveResourceId] = useState(null);

  // Sorting and Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('index'); // 'index' | 'name' | 'category' | 'status' | 'rating'
  const [sortOrder, setSortOrder] = useState('asc');

  // Contact Selection States in Edit Panel
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [hoveredContactId, setHoveredContactId] = useState(null);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addResource({
      name,
      category,
      notes,
      url,
      rating: Number(rating),
      status,
      contactPerson
    });
    setName('');
    setNotes('');
    setUrl('');
    setRating(0);
    setStatus('To Explore');
    setContactPerson('');
    setShowAdd(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return `${BADGE_BASE} bg-accent-emerald/8 text-accent-emerald`;
      case 'Exploring': return `${BADGE_BASE} bg-accent-amber/8 text-amber-700`;
      case 'Unproductive': return `${BADGE_BASE} bg-accent-rose/8 text-accent-rose`;
      case 'To Explore': default: return `${BADGE_BASE} bg-accent-purple/8 text-accent-purple`;
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={12} className="ml-1 opacity-50 align-middle" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp size={12} className="ml-1 text-accent-blue align-middle" />
      : <ArrowDown size={12} className="ml-1 text-accent-blue align-middle" />;
  };

  // Filter resources
  const filteredResources = resources.filter(res => {
    const matchesSearch = 
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = filterCategory === 'All' || res.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || (res.status || 'To Explore') === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === 'index') return 0;
    
    let aVal = '';
    let bVal = '';
    
    if (sortBy === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortBy === 'category') {
      aVal = a.category.toLowerCase();
      bVal = b.category.toLowerCase();
    } else if (sortBy === 'status') {
      aVal = (a.status || 'To Explore').toLowerCase();
      bVal = (b.status || 'To Explore').toLowerCase();
    } else if (sortBy === 'rating') {
      aVal = a.rating || 0;
      bVal = b.rating || 0;
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const activeResource = resources.find(r => r.id === activeResourceId);

  return (
    <div className="flex flex-col gap-5">
      
      {/* Action Header Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3.5 mb-5">
        <div className="flex gap-1.5 flex-wrap items-center">
          <div className="flex items-center gap-3">
            <Compass size={22} color="var(--accent-blue)" />
            <div>
              <h3 className="text-[1.1rem] font-bold text-text-primary">Daily Resources Identified (Goal: 15)</h3>
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

        <button className={BTN_SM_SECONDARY} onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Resource'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-md border border-border-color flex flex-col gap-3.5 animate-slide-down-fade">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Resource Name *</label>
              <input
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. TechCorp Careers, Tech Journal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Category</label>
              <select className={INPUT_FIELD} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Company Directory">Company Directory</option>
                <option value="Job Board">Job Board</option>
                <option value="Network Community">Network Community</option>
                <option value="Target Employer">Target Employer</option>
                <option value="Professional Association">Professional Association</option>
                <option value="Industry Publication">Industry Publication</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Website Link (URL)</label>
              <input
                type="url"
                className={INPUT_FIELD}
                placeholder="e.g. https://careers.techcorp.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Contact Person</label>
              <input
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. John Doe"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Status</label>
              <select className={INPUT_FIELD} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="To Explore">To Explore</option>
                <option value="Exploring">Exploring</option>
                <option value="Completed">Completed</option>
                <option value="Unproductive">Unproductive</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Rating</label>
              <div className="flex gap-1 py-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="bg-transparent border-none cursor-pointer p-0"
                  >
                    <Star
                      size={20}
                      fill={star <= rating ? 'var(--accent-amber, #f59e0b)' : 'none'}
                      color={star <= rating ? 'var(--accent-amber, #f59e0b)' : 'var(--text-muted, #94a3b8)'}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[0.75rem] font-semibold text-text-secondary">Notes</label>
            <input
              type="text"
              className={INPUT_FIELD}
              placeholder="e.g. 5 open positions found"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button type="submit" className={BTN_SM_PRIMARY}>Save Resource</button>
          </div>
        </form>
      )}

      {/* Bulk Action Toolbar */}
      {selectedResources.length > 0 && (
        <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/15 p-3.5 px-4.5 rounded-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={selectedResources.length === sortedResources.length && sortedResources.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedResources(sortedResources.map(r => r.id));
                } else {
                  setSelectedResources([]);
                }
              }}
              className="w-4 h-4 cursor-pointer"
              id="bulk-select-all"
            />
            <label htmlFor="bulk-select-all" className="text-[0.85rem] font-semibold text-text-primary cursor-pointer">
              Select All ({sortedResources.length})
            </label>
            <span className="text-[0.85rem] text-text-secondary">
              • {selectedResources.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete the ${selectedResources.length} selected resources?`)) {
                  selectedResources.forEach(id => deleteResource(id));
                  setSelectedResources([]);
                }
              }}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-rose text-white hover:bg-rose-700 text-xs"
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedResources([])}
              className="inline-flex items-center justify-center gap-2 font-semibold min-h-[34px] px-3.5 py-1.5 rounded-md border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated text-xs"
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      {resources.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 items-center">
          <div className="relative">
            <Search size={16} color="var(--text-muted)" className="absolute left-3 top-2.5" />
            <input
              type="text"
              className={`${INPUT_FIELD} pl-9`}
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className={INPUT_FIELD} 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Company Directory">Company Directory</option>
              <option value="Job Board">Job Board</option>
              <option value="Network Community">Network Community</option>
              <option value="Target Employer">Target Employer</option>
              <option value="Professional Association">Professional Association</option>
              <option value="Industry Publication">Industry Publication</option>
            </select>
          </div>
          <div>
            <select 
              className={INPUT_FIELD} 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="To Explore">To Explore</option>
              <option value="Exploring">Exploring</option>
              <option value="Completed">Completed</option>
              <option value="Unproductive">Unproductive</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Grid/List Wrapper */}
      <div className="flex gap-5 items-start relative w-full max-lg:flex-col max-lg:items-stretch">
        <div className="flex-1 min-w-0">
          {resources.length === 0 ? (
            <div className="bg-bg-card border border-border-color rounded-lg shadow-card text-center p-[3.5rem_1.5rem] text-text-muted flex flex-col items-center gap-2.5">
              <BookOpen className="w-11 h-11 text-text-muted opacity-50" />
              <p>No resources identified for today yet. Click "Add Resource" above.</p>
            </div>
          ) : sortedResources.length === 0 ? (
            <div className="text-center py-8 px-4 text-text-muted flex flex-col items-center gap-2.5">
              <BookOpen className="w-11 h-11 text-text-muted opacity-50" />
              <p>No resources match your filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5" aria-label="Resources list">
              {sortedResources.map(res => {
                const isSelected = selectedResources.includes(res.id);
                const isActive = activeResourceId === res.id;

                return (
                  <div 
                    key={res.id} 
                    className={`flex flex-col gap-3 p-5 relative rounded-lg cursor-pointer transition-all duration-150 hover:shadow-md ${isActive ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                    onClick={() => {
                      setActiveResourceId(res.id);
                      setContactSearchTerm(res.contactPerson || '');
                      setIsContactDropdownOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedResources(prev => [...prev, res.id]);
                            else setSelectedResources(prev => prev.filter(id => id !== res.id));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer mt-1 self-start"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-[1.15rem] font-extrabold font-heading text-text-primary leading-tight">{res.name}</h4>
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Visit resource URL"
                                className={LINK_CLASS}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                          {res.contactPerson && (
                            <div className="flex items-center gap-1 text-[0.8rem] text-text-secondary mt-1 font-semibold">
                              <User size={12} color="var(--text-muted)" />
                              <span>Contact: {res.contactPerson}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <span className={`${BADGE_BASE} bg-accent-blue/8 text-accent-blue`}>{res.category}</span>
                        <span className={getStatusBadgeClass(res.status || 'To Explore')}>
                          {res.status || 'To Explore'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border-color/50 my-1"></div>

                    <div className="flex flex-col gap-2 text-[0.85rem] text-text-secondary mb-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-medium text-text-primary">Notes:</span>
                        <p className="italic text-[0.85rem] bg-bg-card/50 p-2.5 rounded border border-border-color/30 min-h-[44px] break-words w-full">
                          {res.notes || 'No notes provided.'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-border-color/50 my-1 mt-auto"></div>

                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= (res.rating || 0) ? '#f59e0b' : 'none'}
                            color={star <= (res.rating || 0) ? '#f59e0b' : 'var(--text-muted)'}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteResource(res.id); }}
                          className="border border-border-color rounded-lg p-2 text-accent-rose flex items-center justify-center transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          aria-label={`Delete resource ${res.name}`}
                          title="Delete resource"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedResources.map(res => {
                const isSelected = selectedResources.includes(res.id);
                const isActive = activeResourceId === res.id;

                return (
                  <div 
                    key={res.id}
                    className={`flex items-center justify-between p-[0.85rem_1.25rem] rounded-lg cursor-pointer gap-4 flex-wrap transition-all duration-150 ${isActive ? 'border-2 border-accent-blue bg-accent-blue/3' : isSelected ? 'border border-accent-blue bg-bg-card-hover' : 'border border-border-color bg-bg-card hover:border-accent-blue'}`}
                    onClick={() => {
                      setActiveResourceId(res.id);
                      setContactSearchTerm(res.contactPerson || '');
                      setIsContactDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-[250px]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedResources(prev => [...prev, res.id]);
                          else setSelectedResources(prev => prev.filter(id => id !== res.id));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-[1rem] text-text-primary font-bold">{res.name}</strong>
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Visit resource URL"
                              className={LINK_CLASS}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <div className="text-[0.8rem] text-text-secondary">
                          {res.contactPerson && <span className="mr-2 border-r border-border-color pr-2">Contact: {res.contactPerson}</span>}
                          <span>{res.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={getStatusBadgeClass(res.status || 'To Explore')}>{res.status || 'To Explore'}</span>
                      <div className="flex gap-0.5 ml-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill={star <= (res.rating || 0) ? '#f59e0b' : 'none'}
                            color={star <= (res.rating || 0) ? '#f59e0b' : 'var(--text-muted)'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Responsive Side Drawer Spacer to shift listings */}
        {activeResourceId && (
          <div className="w-[400px] shrink-0 max-lg:hidden transition-all duration-300" />
        )}
      </div>

      {/* Inline responsive Side Panel Drawer */}
      {activeResourceId && (() => {
        if (!activeResource) return null;

        return (
          <div className="w-[400px] shrink-0 bg-bg-card border border-border-color rounded-lg shadow-card flex flex-col fixed top-[100px] right-8 bottom-8 z-[100] overflow-hidden animate-slide-in-right max-lg:fixed max-lg:top-[60px] max-lg:right-0 max-lg:bottom-0 max-lg:left-0 max-lg:w-full max-lg:rounded-none max-lg:z-[9999]">
            {/* Header */}
            <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-elevated gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-[1.1rem] font-extrabold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={activeResource.name}>
                  {activeResource.name}
                </h3>
                <div className="text-[0.85rem] text-text-secondary font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={activeResource.category}>
                  {activeResource.category}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete resource ${activeResource.name}?`)) {
                      deleteResource(activeResource.id);
                      setActiveResourceId(null);
                    }
                  }}
                  className="bg-transparent border-none text-text-muted cursor-pointer p-1.5 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600"
                  title="Delete Resource"
                >
                  <Trash2 size={16} color="var(--accent-rose)" />
                </button>
                <button 
                  onClick={() => setActiveResourceId(null)}
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
                  <label className="text-[0.7rem] font-bold text-text-muted block uppercase">Notes</label>
                  <textarea 
                    className={`${INPUT_FIELD} text-[0.8rem] min-h-[80px] p-[0.55rem] resize-y`}
                    value={activeResource.notes || ''} 
                    onChange={(e) => updateResource(activeResource.id, { notes: e.target.value })}
                    placeholder="e.g. 5 open positions found..."
                  />
                </div>

                <div className="flex flex-col gap-1 relative">
                  <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Contact Person</label>
                  
                  {/* Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                    className={`${INPUT_FIELD} text-left flex justify-between items-center bg-bg-card cursor-pointer p-[0.35rem_0.55rem] min-h-[32px] text-[0.8rem] rounded-md border border-border-color ${activeResource.contactPerson ? 'text-text-primary' : 'text-text-muted'}`}
                  >
                    <span>{activeResource.contactPerson || 'Select Contact...'}</span>
                    <span className="text-[0.7rem] text-text-secondary">▼</span>
                  </button>

                  {/* Dropdown Popover List */}
                  {isContactDropdownOpen && (
                    <div className="absolute top-full left-0 w-full max-h-[180px] overflow-y-auto border border-border-color rounded-sm bg-slate-800 z-[100] shadow-md flex flex-col mt-1">
                      <div className="sticky top-0 bg-slate-800 p-2 border-b border-white/10 z-[101] flex items-center gap-2">
                        <Search size={14} color="var(--text-muted)" className="ml-1" />
                        <input
                          type="text"
                          placeholder="Search or type custom..."
                          className="bg-transparent border-none text-white text-[0.8rem] p-1 w-full outline-none"
                          value={contactSearchTerm}
                          onChange={(e) => {
                            setContactSearchTerm(e.target.value);
                            updateResource(activeResource.id, { contactPerson: e.target.value });
                          }}
                        />
                        {contactSearchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setContactSearchTerm('');
                              updateResource(activeResource.id, { contactPerson: '' });
                            }}
                            className="bg-transparent border-none text-text-muted cursor-pointer p-1"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col">
                        {(allContacts || []).filter(c => 
                          c.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                          (c.organization || '').toLowerCase().includes(contactSearchTerm.toLowerCase())
                        ).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseEnter={() => setHoveredContactId(c.id)}
                            onMouseLeave={() => setHoveredContactId(null)}
                            onClick={() => {
                              setContactSearchTerm(c.name);
                              updateResource(activeResource.id, { contactPerson: c.name });
                              setIsContactDropdownOpen(false);
                            }}
                            className="text-left text-white border-none p-[0.5rem_0.6rem] text-[0.75rem] cursor-pointer flex justify-between items-center border-b border-white/5 w-full"
                            style={{
                              background: (activeResource.contactPerson || '').toLowerCase() === c.name.toLowerCase() 
                                ? 'rgba(37, 99, 235, 0.4)' 
                                : hoveredContactId === c.id 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'transparent'
                            }}
                          >
                            <span className="font-semibold">{c.name}</span>
                            {c.organization && <span className="text-gray-400 text-[0.7rem]">{c.organization}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Status</label>
                    <select 
                      className={`${INPUT_FIELD} text-[0.8rem] p-[0.35rem_0.55rem] min-h-[32px]`}
                      value={activeResource.status || 'To Explore'} 
                      onChange={(e) => updateResource(activeResource.id, { status: e.target.value })}
                    >
                      <option value="To Explore">To Explore</option>
                      <option value="Exploring">Exploring</option>
                      <option value="Completed">Completed</option>
                      <option value="Unproductive">Unproductive</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[0.7rem] font-bold text-text-muted block uppercase mb-1">Rating</label>
                    <div className="flex gap-1 py-[0.35rem] min-h-[32px] items-center bg-bg-card border border-border-color rounded-md px-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateResource(activeResource.id, { rating: star })}
                          className="bg-transparent border-none cursor-pointer p-0"
                        >
                          <Star
                            size={16}
                            fill={star <= (activeResource.rating || 0) ? 'var(--accent-amber, #f59e0b)' : 'none'}
                            color={star <= (activeResource.rating || 0) ? 'var(--accent-amber, #f59e0b)' : 'var(--text-muted, #94a3b8)'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border-color"></div>
              
              <div className="flex flex-col gap-2.5">
                <h4 className="text-[0.85rem] font-bold text-text-primary">Resource Details</h4>
                <div className="flex flex-col gap-2">
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Name:</span>
                    <input 
                      type="text"
                      className="bg-transparent border-none text-text-primary font-semibold outline-none focus:border-b focus:border-accent-blue py-1"
                      value={activeResource.name}
                      onChange={(e) => updateResource(activeResource.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Category:</span>
                    <select
                      className="bg-transparent border-none text-text-primary outline-none focus:border-b focus:border-accent-blue py-1"
                      value={activeResource.category}
                      onChange={(e) => updateResource(activeResource.id, { category: e.target.value })}
                    >
                      <option value="Company Directory">Company Directory</option>
                      <option value="Job Board">Job Board</option>
                      <option value="Network Community">Network Community</option>
                      <option value="Target Employer">Target Employer</option>
                      <option value="Professional Association">Professional Association</option>
                      <option value="Industry Publication">Industry Publication</option>
                    </select>
                  </div>
                  <div className="text-[0.85rem]">
                    <span className="text-text-muted font-medium w-24 inline-block">Website Link:</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="url"
                        className="bg-transparent border-none text-text-primary outline-none focus:border-b focus:border-accent-blue py-1 flex-1"
                        value={activeResource.url || ''}
                        onChange={(e) => updateResource(activeResource.id, { url: e.target.value })}
                        placeholder="https://..."
                      />
                      {activeResource.url && (
                        <a href={activeResource.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} title="Open link">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
