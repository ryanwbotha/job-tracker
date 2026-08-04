import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Compass, Plus, Trash2, BookOpen } from 'lucide-react';

export default function ResourceTracker() {
  const { resources, addResource, deleteResource } = useTracker();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Company Directory');
  const [notes, setNotes] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addResource({ name, category, notes });
    setName('');
    setNotes('');
    setShowAdd(false);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <Compass size={22} color="var(--accent-blue)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Daily Resources Identified (Goal: 15)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Identify companies, contacts, industry lists, or business directories daily.
            </p>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} />
          <span>{showAdd ? 'Cancel' : 'Add Resource'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 180px 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Resource Name (e.g. Ancestry Careers, Tech Journal)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select className="select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Company Directory">Company Directory</option>
            <option value="Network Community">Network Community</option>
            <option value="Target Employer">Target Employer</option>
            <option value="Professional Association">Professional Association</option>
            <option value="Industry Publication">Industry Publication</option>
          </select>
          <input
            type="text"
            className="input-field"
            placeholder="Notes (e.g. 5 open positions found)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Save</button>
        </form>
      )}

      {resources.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <p>No resources identified for today yet. Click "Add Resource" above.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Resource Name</th>
                <th>Category</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res, index) => (
                <tr key={res.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{res.name}</td>
                  <td>
                    <span className="badge badge-blue">{res.category}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{res.notes || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => deleteResource(res.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Delete resource"
                    >
                      <Trash2 size={16} />
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
