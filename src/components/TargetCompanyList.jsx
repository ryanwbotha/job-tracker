import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Building2, Plus, X } from 'lucide-react';

export default function TargetCompanyList() {
  const { targets, addTarget, deleteTarget } = useTracker();
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTarget.trim()) {
      addTarget(newTarget.trim());
      setNewTarget('');
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <Building2 size={22} color="var(--accent-amber)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Target Organizations & Sectors</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Primary companies and industries you are targeting for networking and applications.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '1rem' }}>
        {targets.map(target => (
          <div
            key={target}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.03em'
            }}
          >
            <span>{target}</span>
            <button
              onClick={() => deleteTarget(target)}
              style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <form onSubmit={handleAdd} style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Add Target (e.g. FINTECHS)"
            style={{ width: '180px', padding: '0.4rem 0.65rem', fontSize: '0.825rem' }}
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <Plus size={14} />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
}
