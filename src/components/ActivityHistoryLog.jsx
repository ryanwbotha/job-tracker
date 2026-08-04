import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { History, Clock, Activity } from 'lucide-react';

export default function ActivityHistoryLog() {
  const { history } = useTracker();

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          <History size={22} color="var(--accent-purple)" />
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Activity History Log</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Chronological log of all daily activity entries, outreach, meetings, and updates over time.
            </p>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <Activity className="empty-state-icon" />
          <p>No activity logged in history yet. Start adding resources or contacts!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', paddingLeft: '1.25rem' }}>
          {/* Vertical Timeline line */}
          <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: 'var(--border-color)' }} />

          {history.map((entry, index) => (
            <div
              key={entry.id || index}
              style={{
                position: 'relative',
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              {/* Timeline Bullet Dot */}
              <div style={{ position: 'absolute', left: '-1.3rem', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', border: '2px solid #ffffff' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${entry.category === 'Contact' ? 'badge-emerald' : entry.category === 'Meeting' ? 'badge-purple' : entry.category === 'Resource' ? 'badge-blue' : 'badge-amber'}`}>
                  {entry.category}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {entry.actionText}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={12} />
                <span>{entry.dateString || new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
