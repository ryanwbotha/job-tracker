import React, { useEffect, useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { RotateCcw, X } from 'lucide-react';

export default function UndoToastNotification() {
  const { lastDeleted, restoreLastDeleted, clearLastDeleted } = useTracker();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!lastDeleted) return;
    setTimeLeft(5);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          clearLastDeleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lastDeleted]);

  if (!lastDeleted) return null;

  const itemName = typeof lastDeleted.item === 'string'
    ? lastDeleted.item
    : (lastDeleted.item?.name || 'item');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 200,
        background: 'var(--bg-sidebar)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '300px',
      }}
      className="flex flex-col gap-2.5 p-4 animate-slideInRight"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">
            Deleted <strong>{lastDeleted.type}</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>"{itemName}"</span>
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">
            Auto-closing in {timeLeft}s
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={restoreLastDeleted}
            className="btn btn-primary btn-xs"
          >
            <RotateCcw size={12} />
            Undo
          </button>
          <button
            onClick={clearLastDeleted}
            style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none' }}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-colors hover:!bg-[var(--bg-elevated)] hover:!text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Countdown progress bar */}
      <div
        style={{ background: 'var(--border)', height: '2px', borderRadius: '999px', overflow: 'hidden' }}
      >
        <div
          style={{
            width: `${(timeLeft / 5) * 100}%`,
            background: '#3b82f6',
            height: '100%',
            transition: 'width 1s linear',
            borderRadius: 'inherit',
          }}
        />
      </div>
    </div>
  );
}
