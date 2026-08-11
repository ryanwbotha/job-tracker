import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { Database, Search, Users, Video, Compass, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';
import Linkedin from './LinkedinIcon';

// Tailwind CSS styling constants for v4 migration
const INPUT_FIELD = "w-full rounded-lg border border-border-color bg-bg-input px-3 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm outline-none transition focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/10";
const BADGE_BASE = "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";
const TH_CLASS = "px-3 py-2 text-left text-sm font-medium text-gray-900 whitespace-nowrap";
const TD_CLASS = "px-3 py-2 text-sm text-gray-700 whitespace-nowrap";
const LINK_CLASS = "inline-flex items-center gap-1 text-sm text-indigo-600 font-medium underline-offset-2 hover:underline hover:text-indigo-700";

export default function AllMasterView() {
  const { allContacts: contacts, allResources: resources, allMeetings: meetings, deleteContact, deleteResource, deleteMeeting, updateContact } = useTracker();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'contacts' | 'resources' | 'meetings'

  // Combine items
  const allContacts = contacts.map(c => ({ ...c, itemType: 'Contact' }));
  const allResources = resources.map(r => ({ ...r, itemType: 'Resource' }));
  const allMeetings = meetings.map(m => ({ ...m, itemType: 'Meeting' }));

  let combined = [];
  if (typeFilter === 'all') combined = [...allContacts, ...allMeetings, ...allResources];
  else if (typeFilter === 'contacts') combined = allContacts;
  else if (typeFilter === 'meetings') combined = allMeetings;
  else if (typeFilter === 'resources') combined = allResources;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    combined = combined.filter(item => {
      const name = (item.name || '').toLowerCase();
      const org = (item.organization || '').toLowerCase();
      const notes = (item.notes || item.comments || '').toLowerCase();
      const cat = (item.category || item.kindOfContact || item.kindOfMeeting || '').toLowerCase();
      return name.includes(q) || org.includes(q) || notes.includes(q) || cat.includes(q);
    });
  }

  const handleDelete = (item) => {
    if (item.itemType === 'Contact') deleteContact(item.id);
    else if (item.itemType === 'Meeting') deleteMeeting(item.id);
    else if (item.itemType === 'Resource') deleteResource(item.id);
  };

  return (
    <div className="section-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Database size={22} color="var(--accent-blue)" />
          <div>
            <h3 className="text-[1.1rem] font-bold text-text-primary">All Contacts & Resources Master Database</h3>
            <p className="text-[0.8rem] text-text-secondary">
              Unified master view of all recorded contacts, resources, and meetings across your job search.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'contacts', label: 'Contacts' },
            { id: 'meetings', label: 'Meetings' },
            { id: 'resources', label: 'Resources' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`border border-border-color rounded-md p-[0.3rem_0.65rem] text-[0.775rem] font-semibold cursor-pointer transition-colors ${
                typeFilter === f.id ? 'bg-text-primary text-text-invert border-transparent' : 'bg-bg-card text-text-secondary hover:bg-bg-elevated'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="mb-[1.15rem] relative">
        <Search size={16} color="var(--text-muted)" className="absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by name, organization, notes, or contact type..."
          className={`${INPUT_FIELD} pl-9`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {combined.length === 0 ? (
        <div className="text-center py-10 px-5 text-text-muted flex flex-col items-center gap-2.5">
          <Database className="w-11 h-11 text-text-muted opacity-50" />
          <p>No items found matching your filter or search query.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={TH_CLASS}>Type</th>
                <th className={TH_CLASS}>Name / Resource</th>
                <th className={TH_CLASS}>Organization / Category</th>
                <th className={TH_CLASS}>Details / Notes</th>
                <th className={TH_CLASS}>Follow-up Date</th>
                <th className={`${TH_CLASS} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combined.map(item => (
                <tr key={item.id} className="group">
                  <td className={TD_CLASS}>
                    <span className={`${BADGE_BASE} ${item.itemType === 'Contact' ? 'bg-accent-emerald/8 text-accent-emerald' : item.itemType === 'Meeting' ? 'bg-accent-purple/8 text-accent-purple' : 'bg-accent-blue/8 text-accent-blue'}`}>
                      {item.itemType}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} font-semibold`}>
                    <div>{item.name}</div>
                    {item.linkedinUrl && (
                      <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        <Linkedin size={12} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {item.itemType === 'Resource' && item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${LINK_CLASS} mt-1`}>
                        <ExternalLink size={12} />
                        <span className="ml-1">Link</span>
                      </a>
                    )}
                  </td>
                  <td className={TD_CLASS}>{item.organization || item.category || '—'}</td>
                  <td className={`${TD_CLASS} text-text-secondary text-[0.825rem] max-w-[280px]`}>
                    {item.comments || item.notes || '—'}
                  </td>
                  <td className={TD_CLASS}>
                    {item.followUpDate ? (
                      <span className="text-[0.825rem] font-semibold text-[#b45309]">
                        {formatFriendlyDate(item.followUpDate)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className={`${TD_CLASS} text-right`}>
                    <button
                      onClick={() => handleDelete(item)}
                      className="bg-transparent border-none text-accent-rose cursor-pointer p-1 rounded-sm hover:bg-rose-50"
                      title="Delete item"
                    >
                      <Trash2 size={15} />
                    </button>
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
