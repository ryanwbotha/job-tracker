import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Compass, Plus, Trash2, BookOpen, ExternalLink, Star, User, X, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

// Tailwind CSS styling constants for v4 migration
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4";
const BTN_PRIMARY = `${BTN_BASE} border-indigo-600 bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200`;
const BTN_SECONDARY = `${BTN_BASE} border-border-color bg-bg-card px-5 py-2.5 text-text-primary hover:bg-bg-elevated focus-visible:ring-slate-200`;
const BTN_SM_PRIMARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-transparent cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-accent-blue text-white hover:bg-blue-700`;
const BTN_SM_SECONDARY = `inline-flex items-center justify-center gap-2 font-semibold text-[16px] min-h-[40px] px-3.5 py-1.5 rounded-sm border border-border-color cursor-pointer transition-colors active:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue bg-bg-card text-text-primary hover:bg-bg-elevated`;

const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const TH_CLASS = "px-3 py-2 text-left text-sm font-medium text-gray-900 whitespace-nowrap";
const TD_CLASS = "px-3 py-2 text-sm text-gray-700 whitespace-nowrap";
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
  const [editingResource, setEditingResource] = useState(null);

  // Sorting and Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('index'); // 'index' | 'name' | 'category' | 'status' | 'rating'
  const [sortOrder, setSortOrder] = useState('asc');

  // Contact Selection States in Edit Modal
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

  return (
    <div className="section-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Compass size={22} color="var(--accent-blue)" />
          <div>
            <h3 className="text-[1.1rem] font-bold text-text-primary">Daily Resources Identified (Goal: 15)</h3>
            <p className="text-[0.8rem] text-text-secondary">
              Identify companies, contacts, industry lists, or business directories daily.
            </p>
          </div>
        </div>

        <button className={BTN_SM_SECONDARY} onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Resource'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-md mb-5 border border-border-color flex flex-col gap-3.5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Resource Name *</label>
              <input
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Ancestry Careers, Tech Journal"
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
                placeholder="e.g. https://careers.ancestry.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Contact Person</label>
              <input
                type="text"
                className={INPUT_FIELD}
                placeholder="e.g. Tyler Jensen"
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

      {resources.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <p>No resources identified for today yet. Click "Add Resource" above.</p>
        </div>
      ) : (
        <>
          {/* Search and Filters Toolbar */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-5 items-center">
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

          {sortedResources.length === 0 ? (
            <div className="text-center py-8 px-4 text-text-muted flex flex-col items-center gap-2.5">
              <BookOpen className="w-11 h-11 text-text-muted opacity-50" />
              <p>No resources match your filters.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className={`${TH_CLASS} cursor-pointer select-none`} onClick={() => handleSort('index')}>
                      # {renderSortIcon('index')}
                    </th>
                    <th className={`${TH_CLASS} cursor-pointer select-none`} onClick={() => handleSort('name')}>
                      Resource Name {renderSortIcon('name')}
                    </th>
                    <th className={`${TH_CLASS} cursor-pointer select-none`} onClick={() => handleSort('category')}>
                      Category {renderSortIcon('category')}
                    </th>
                    <th className={`${TH_CLASS} cursor-pointer select-none`} onClick={() => handleSort('status')}>
                      Status {renderSortIcon('status')}
                    </th>
                    <th className={`${TH_CLASS} cursor-pointer select-none`} onClick={() => handleSort('rating')}>
                      Rating {renderSortIcon('rating')}
                    </th>
                    <th className={TH_CLASS}>Notes</th>
                    <th className={`${TH_CLASS} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResources.map((res, index) => (
                    <tr key={res.id} className="group">
                      <td className={`${TD_CLASS} text-text-muted font-semibold`}>{index + 1}</td>
                      <td
                        className={`${TD_CLASS} font-semibold cursor-pointer`}
                        onClick={() => {
                          setEditingResource({ ...res });
                          setContactSearchTerm(res.contactPerson || '');
                          setIsContactDropdownOpen(false);
                        }}
                        title="Click to edit resource"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="resource-name-text">{res.name}</span>
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
                          <div className="flex items-center gap-1 text-[0.75rem] text-text-secondary mt-1 font-normal">
                            <User size={12} color="var(--text-muted)" />
                            <span>Contact: {res.contactPerson}</span>
                          </div>
                        )}
                      </td>
                      <td className={TD_CLASS}>
                        <span className={`${BADGE_BASE} bg-accent-blue/8 text-accent-blue`}>{res.category}</span>
                      </td>
                      <td className={TD_CLASS}>
                        <span className={getStatusBadgeClass(res.status || 'To Explore')}>
                          {res.status || 'To Explore'}
                        </span>
                      </td>
                      <td className={TD_CLASS}>
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
                      </td>
                      <td className={`${TD_CLASS} text-text-secondary text-[0.85rem] break-words`}>{res.notes || '—'}</td>
                      <td className={`${TD_CLASS} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => deleteResource(res.id)}
                            className="bg-transparent border-none text-accent-rose cursor-pointer p-1"
                            title="Delete resource"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

    {/* Edit Resource Modal */}
    {editingResource && (
      <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-5 animate-fadeIn" onClick={() => setEditingResource(null)}>
        <div className="bg-bg-card border border-border-color rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col gap-4.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Compass color="var(--accent-blue)" size={22} />
              <h2 className="text-[1.2rem] font-bold text-text-primary">Edit Resource</h2>
            </div>
            <button className={CLOSE_BTN} onClick={() => setEditingResource(null)}>
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-3.5 mt-4 mb-5">
            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Resource Name *</label>
              <input
                type="text"
                className={INPUT_FIELD}
                value={editingResource.name}
                onChange={(e) => setEditingResource(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Category</label>
              <select
                className={INPUT_FIELD}
                value={editingResource.category}
                onChange={(e) => setEditingResource(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Company Directory">Company Directory</option>
                <option value="Job Board">Job Board</option>
                <option value="Network Community">Network Community</option>
                <option value="Target Employer">Target Employer</option>
                <option value="Professional Association">Professional Association</option>
                <option value="Industry Publication">Industry Publication</option>
              </select>
            </div>            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-semibold text-text-secondary">Website Link (URL)</label>
                <input
                  type="url"
                  className={INPUT_FIELD}
                  placeholder="https://..."
                  value={editingResource.url || ''}
                  onChange={(e) => setEditingResource(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1 relative">
                <label className="text-[0.75rem] font-semibold text-text-secondary">Contact Person</label>
                
                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                  className={`${INPUT_FIELD} text-left flex justify-between items-center bg-slate-100/50 cursor-pointer p-[0.5rem_0.75rem] rounded-sm ${editingResource.contactPerson ? 'text-text-primary' : 'text-text-muted'}`}
                >
                  <span>{editingResource.contactPerson || 'Select Contact...'}</span>
                  <span className="text-[0.8rem] text-text-secondary">▼</span>
                </button>

                {/* Dropdown Popover List */}
                {isContactDropdownOpen && (
                  <div className="absolute top-full left-0 w-full max-h-[180px] overflow-y-auto border border-border-color rounded-sm bg-[#0f172a] z-[100] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3),0_4px_6px_-2px_rgba(0,0,0,0.05)] flex flex-col">
                    {/* Sticky Search Input */}
                    <div className="sticky top-0 bg-slate-800 p-2.5 px-3 border-b border-border-color z-[101] flex items-center gap-2">
                      <Search size={14} color="var(--text-muted)" className="ml-1" />
                      <input
                        type="text"
                        placeholder="Search or type custom..."
                        className={`${INPUT_FIELD} bg-slate-900/50 text-[0.8rem] px-3 py-1.5 w-full`}
                        value={contactSearchTerm}
                        onChange={(e) => {
                          setContactSearchTerm(e.target.value);
                          setEditingResource(prev => ({ ...prev, contactPerson: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()} // prevent dropdown from closing
                      />
                      {contactSearchTerm && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactSearchTerm('');
                            setEditingResource(prev => ({ ...prev, contactPerson: '' }));
                          }}
                          className="bg-transparent border-none text-text-muted cursor-pointer p-1"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Scrollable Contacts List */}
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
                            setEditingResource(prev => ({ ...prev, contactPerson: c.name }));
                            setIsContactDropdownOpen(false); // close dropdown on select
                          }}
                          className="text-left text-text-primary border-none p-[0.4rem_0.6rem] text-[0.75rem] cursor-pointer flex justify-between items-center border-b border-white/5 w-full"
                          style={{
                            background: (editingResource.contactPerson || '').toLowerCase() === c.name.toLowerCase() 
                              ? 'rgba(37, 99, 235, 0.25)' 
                              : hoveredContactId === c.id 
                              ? 'rgba(255, 255, 255, 0.08)' 
                              : 'transparent'
                          }}
                        >
                          <span className="font-semibold">{c.name}</span>
                          {c.organization && <span className="text-text-muted text-[0.7rem]">{c.organization}</span>}
                        </button>
                      ))}
                      {(allContacts || []).filter(c => 
                        c.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                        (c.organization || '').toLowerCase().includes(contactSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-[0.725rem] text-text-muted text-center">
                          No matching contacts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_180px] gap-3 items-center">
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-semibold text-text-secondary">Status</label>
                <select
                  className={INPUT_FIELD}
                  value={editingResource.status || 'To Explore'}
                  onChange={(e) => setEditingResource(prev => ({ ...prev, status: e.target.value }))}
                >
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
                      onClick={() => setEditingResource(prev => ({ ...prev, rating: star }))}
                      className="bg-transparent border-none cursor-pointer p-0"
                    >
                      <Star
                        size={20}
                        fill={star <= (editingResource.rating || 0) ? 'var(--accent-amber, #f59e0b)' : 'none'}
                        color={star <= (editingResource.rating || 0) ? 'var(--accent-amber, #f59e0b)' : 'var(--text-muted, #94a3b8)'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.75rem] font-semibold text-text-secondary">Notes</label>
              <textarea
                className={`${INPUT_FIELD} min-h-[80px] resize-y p-2`}
                value={editingResource.notes || ''}
                onChange={(e) => setEditingResource(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className={BTN_SECONDARY} onClick={() => setEditingResource(null)}>Cancel</button>
              <button
                className={BTN_PRIMARY}
                onClick={() => {
                  if (!editingResource.name.trim()) return;
                  updateResource(editingResource.id, editingResource);
                  setEditingResource(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
