import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Compass, Users, Video } from 'lucide-react';

function ProgressRing({ current, total, color }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, Math.round((current / total) * 100));
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="progress-ring-container">
      <svg width="66" height="66" viewBox="0 0 66 66">
        <circle
          cx="33"
          cy="33"
          r={radius}
          stroke="rgba(0, 0, 0, 0.04)"
          strokeWidth="3.5"
          fill="transparent"
        />
        <circle
          cx="33"
          cy="33"
          r={radius}
          stroke={color}
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          transform="rotate(-90 33 33)"
        />
      </svg>
      <span className="progress-ring-text" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{current}</span>
    </div>
  );
}

export default function DailyProgressCard({ setActiveView }) {
  const { resources, contacts, meetings } = useTracker();

  const resCount = resources.length;
  const conCount = contacts.length;
  const mtgCount = meetings.length;

  const cards = [
    {
      id: 'resources',
      title: '15 Resources',
      count: resCount,
      total: 15,
      icon: Compass,
      color: '#2563eb',
      bgColor: 'rgba(37, 99, 235, 0.04)',
      borderColor: 'rgba(37, 99, 235, 0.08)',
      subtitle: `${Math.round((resCount / 15) * 100)}% of daily goal`,
      ariaLabel: '15 Resources Progress Card. Click to view Resources Identified section.'
    },
    {
      id: 'contacts',
      title: '10 Contacts',
      count: conCount,
      total: 10,
      icon: Users,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.04)',
      borderColor: 'rgba(16, 185, 129, 0.08)',
      subtitle: `${Math.round((conCount / 10) * 100)}% of daily goal`,
      ariaLabel: '10 Contacts Progress Card. Click to view Contacts Made section.'
    },
    {
      id: 'meetings',
      title: '2 Meetings',
      count: mtgCount,
      total: 2,
      icon: Video,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.04)',
      borderColor: 'rgba(139, 92, 246, 0.08)',
      subtitle: `${Math.round((mtgCount / 2) * 100)}% of daily goal`,
      ariaLabel: '2 Meetings Progress Card. Click to view Face-to-Face Meetings section.'
    }
  ];

  return (
    <div className="progress-grid">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="progress-card"
            onClick={() => setActiveView && setActiveView(card.id)}
            role="button"
            tabIndex={0}
            aria-label={card.ariaLabel}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && setActiveView) {
                e.preventDefault();
                setActiveView(card.id);
              }
            }}
            style={{ 
              cursor: 'pointer',
              background: card.bgColor,
              borderColor: card.borderColor,
              borderWidth: '1px',
              borderStyle: 'solid',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              e.currentTarget.style.borderColor = card.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
              e.currentTarget.style.borderColor = card.borderColor;
            }}
            title={`Click to view ${card.title} section`}
          >
            <ProgressRing current={card.count} total={card.total} color={card.color} />

            <div className="progress-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon size={16} color={card.color} />
                <span className="progress-title" style={{ color: card.color, fontWeight: 700 }}>{card.title}</span>
              </div>
              <div className="progress-count" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {card.count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {card.total}</span>
              </div>
              <span className="progress-subtitle" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
