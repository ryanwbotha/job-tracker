import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { formatFriendlyDate } from '../utils/followUpRules';
import { Database, Search, Users, Video, Compass, Trash2, CheckCircle2 } from 'lucide-react';
import Linkedin from './LinkedinIcon';

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
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <Database size={22} color="var(--accent-blue)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>All Contacts & Resources Master Database</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Unified master view of all recorded contacts, resources, and meetings across your job search.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'contacts', label: 'Contacts' },
            { id: 'meetings', label: 'Meetings' },
            { id: 'resources', label: 'Resources' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              style={{
                background: typeFilter === f.id ? 'var(--text-primary)' : '#ffffff',
                color: typeFilter === f.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1.15rem', position: 'relative' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search by name, organization, notes, or contact type..."
          style={{ paddingLeft: '36px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {combined.length === 0 ? (
        <div className="empty-state">
          <Database className="empty-state-icon" />
          <p>No items found matching your filter or search query.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name / Resource</th>
                <th>Organization / Category</th>
                <th>Details / Notes</th>
                <th>Follow-up Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combined.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className={`badge ${item.itemType === 'Contact' ? 'badge-emerald' : item.itemType === 'Meeting' ? 'badge-purple' : 'badge-blue'}`}>
                      {item.itemType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    <div>{item.name}</div>
                    {item.linkedinUrl && (
                      <a href={item.linkedinUrl} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                        <Linkedin size={12} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </td>
                  <td>{item.organization || item.category || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', maxWidth: '280px' }}>
                    {item.comments || item.notes || '—'}
                  </td>
                  <td>
                    {item.followUpDate ? (
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#b45309' }}>
                        {formatFriendlyDate(item.followUpDate)}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(item)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0.2rem' }}
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
