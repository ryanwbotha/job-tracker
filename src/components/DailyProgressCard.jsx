import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Compass, Users, Video } from 'lucide-react';

function ProgressRing({ current, total, color }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(100, total > 0 ? Math.round((current / total) * 100) : 0);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="w-[60px] h-[60px] shrink-0 relative flex items-center justify-center">
      <svg width="60" height="60" viewBox="0 0 60 60">
        {/* Track */}
        <circle
          cx="30" cy="30" r={radius}
          stroke="var(--border)"
          strokeWidth="3"
          fill="transparent"
        />
        {/* Progress */}
        <circle
          cx="30" cy="30" r={radius}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          transform="rotate(-90 30 30)"
        />
      </svg>
      <span
        style={{ color: 'var(--text-primary)' }}
        className="absolute font-bold text-[1.05rem] leading-none"
      >
        {current}
      </span>
    </div>
  );
}

export default function DailyProgressCard({ setActiveView }) {
  const { resources, contacts, meetings } = useTracker();

  const cards = [
    {
      id: 'resources',
      title: '15 Resources',
      icon: Compass,
      count: resources.length,
      total: 15,
      color: '#3b82f6',
      accentBg: 'rgba(59,130,246,0.08)',
      accentBorder: 'rgba(59,130,246,0.2)',
      iconBg: 'rgba(59,130,246,0.1)',
    },
    {
      id: 'contacts',
      title: '10 Contacts',
      icon: Users,
      count: contacts.length,
      total: 10,
      color: '#10b981',
      accentBg: 'rgba(16,185,129,0.08)',
      accentBorder: 'rgba(16,185,129,0.2)',
      iconBg: 'rgba(16,185,129,0.1)',
    },
    {
      id: 'meetings',
      title: '2 Meetings',
      icon: Video,
      count: meetings.length,
      total: 2,
      color: '#8b5cf6',
      accentBg: 'rgba(139,92,246,0.08)',
      accentBorder: 'rgba(139,92,246,0.2)',
      iconBg: 'rgba(139,92,246,0.1)',
    },
  ];

  return (
    <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        const pct = Math.min(100, card.total > 0 ? Math.round((card.count / card.total) * 100) : 0);
        const met = card.count >= card.total;

        return (
          <div
            key={card.id}
            onClick={() => setActiveView && setActiveView(card.id)}
            role="button"
            tabIndex={0}
            aria-label={`${card.title} — ${card.count} of ${card.total}. Click to view.`}
            onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && setActiveView) { e.preventDefault(); setActiveView(card.id); } }}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${met ? card.color + '44' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="flex items-center gap-3.5 p-4 px-4.5 hover:translate-y-[-2px] hover:!shadow-[var(--shadow-md)]"
          >
            <ProgressRing current={card.count} total={card.total} color={card.color} />

            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="rounded-md p-1" style={{ background: card.iconBg }}>
                  <Icon size={12} color={card.color} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: card.color }}>
                  {card.title}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">
                  {card.count}
                </span>
                <span style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">
                  / {card.total}
                </span>
              </div>

              {/* Mini progress bar */}
              <div
                className="h-1 rounded-full overflow-hidden mt-0.5"
                style={{ background: 'var(--border)' }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    background: card.color,
                    transition: 'width 0.5s ease',
                    height: '100%',
                    borderRadius: 'inherit',
                  }}
                />
              </div>
              <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium">
                {pct}% {met ? '✓ Goal met!' : 'of daily goal'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
