import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { History, Clock, Activity } from 'lucide-react';

const CATEGORY_BADGE = {
  Contact:  { bg: 'rgba(16,185,129,0.12)',  text: '#10b981' },
  Meeting:  { bg: 'rgba(139,92,246,0.12)',  text: '#8b5cf6' },
  Resource: { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6' },
  default:  { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b' },
};

export default function ActivityHistoryLog() {
  const { history } = useTracker();

  return (
    <div className="section-card p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(139,92,246,0.12)' }}
        >
          <History size={17} color="#8b5cf6" />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-primary)' }} className="text-[0.9375rem] font-semibold">
            Activity History Log
          </h3>
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
            Chronological log of all daily activity entries, outreach, meetings, and updates
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
          className="py-12 flex flex-col items-center gap-2 text-center"
        >
          <Activity size={24} style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium mt-1">
            No activity logged yet
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">
            Start adding resources or contacts to see history appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 relative pl-5">
          {/* Timeline line */}
          <div
            className="absolute left-[7px] top-2 bottom-2 w-0.5"
            style={{ background: 'var(--border)' }}
          />

          {history.map((entry, index) => {
            const badge = CATEGORY_BADGE[entry.category] || CATEGORY_BADGE.default;
            return (
              <div
                key={entry.id || index}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="relative flex items-center justify-between gap-3 px-4 py-3"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-[-21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                  style={{ background: '#3b82f6', border: '2px solid var(--bg-app)' }}
                />

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {entry.category}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">
                    {entry.actionText}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1.5 text-xs shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Clock size={11} />
                  <span>{entry.dateString || new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
