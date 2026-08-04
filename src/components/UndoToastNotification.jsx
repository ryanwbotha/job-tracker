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

  const itemName = typeof lastDeleted.item === 'string' ? lastDeleted.item : (lastDeleted.item.name || 'item');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        background: '#0f172a',
        color: '#ffffff',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '0.85rem 1.1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '320px',
        animation: 'slideUp 0.25s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
          <span>Deleted <strong>{lastDeleted.type}</strong> "{itemName}"</span>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Auto-closing in {timeLeft}s</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={restoreLastDeleted}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RotateCcw size={14} />
            <span>Undo</span>
          </button>
          <button
            onClick={clearLastDeleted}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 5-second Progress Bar */}
      <div style={{ background: '#334155', height: '3px', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          style={{
            background: '#2563eb',
            height: '100%',
            width: `${(timeLeft / 5) * 100}%`,
            transition: 'width 1s linear'
          }}
        />
      </div>
    </div>
  );
}
