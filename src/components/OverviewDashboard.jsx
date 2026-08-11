import React from 'react';
import { useTracker } from '../context/TrackerContext';
import DailyProgressCard from './DailyProgressCard';
import DailyStrategyCoach from './DailyStrategyCoach';
import { Briefcase, ArrowRight, TrendingUp } from 'lucide-react';

const FUNNEL_STAGES = [
  { key: 'Wishlist',     label: 'Wishlist',      color: '#64748b', accentBg: 'rgba(100,116,139,0.12)', accentText: '#94a3b8' },
  { key: 'Applied',      label: 'Applied',       color: '#f59e0b', accentBg: 'rgba(245,158,11,0.12)',  accentText: '#fcd34d' },
  { key: 'Interviewing', label: 'Interviewing',  color: '#8b5cf6', accentBg: 'rgba(139,92,246,0.12)',  accentText: '#c4b5fd' },
  { key: 'Offer',        label: 'Offer',         color: '#10b981', accentBg: 'rgba(16,185,129,0.12)',  accentText: '#6ee7b7' },
  { key: 'Rejected',     label: 'Rejected',      color: '#f43f5e', accentBg: 'rgba(244,63,94,0.12)',   accentText: '#fda4af' },
];

export default function OverviewDashboard({ setActiveView }) {
  const { allResources } = useTracker();

  const jobApplications = (allResources || []).filter(res => res.category === 'Job Application');
  const totalJobs = jobApplications.length;
  const totalForBar = totalJobs || 1;

  const counts = {};
  FUNNEL_STAGES.forEach(s => {
    counts[s.key] = jobApplications.filter(j => (s.key === 'Wishlist' ? (j.status || 'Wishlist') : j.status) === s.key).length;
  });

  const rejectedCount = counts['Rejected'] || 0;
  const totalActive = totalJobs - rejectedCount;

  return (
    <div className="flex flex-col gap-5">
      {/* AI Strategy Coach Banner */}
      <DailyStrategyCoach />

      {/* 15-10-2 Daily Goal Progress Cards */}
      <DailyProgressCard setActiveView={setActiveView} />

      {/* Job Search Funnel Widget */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
        className="p-5 md:p-6 flex flex-col gap-4 w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: 'rgba(59,130,246,0.1)' }}
            >
              <TrendingUp size={17} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)' }} className="text-[0.9375rem] font-semibold leading-tight">
                Job Search Funnel
              </h3>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">
                {totalActive} active · {totalJobs} total tracked
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView && setActiveView('jobTracker')}
            className="btn btn-ghost btn-xs"
          >
            Open Tracker
            <ArrowRight size={11} />
          </button>
        </div>

        {/* Empty state */}
        {totalJobs === 0 ? (
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
            className="py-10 flex flex-col items-center gap-1 text-center"
          >
            <Briefcase size={24} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium mt-2">No jobs tracked yet</span>
            <span style={{ color: 'var(--text-muted)' }} className="text-xs">Go to Job Tracker to log your first application.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stacked Progress Bar */}
            <div
              className="flex h-2 rounded-full overflow-hidden gap-0.5"
              style={{ background: 'var(--bg-elevated)' }}
            >
              {FUNNEL_STAGES.map(stage => {
                const count = counts[stage.key] || 0;
                if (!count) return null;
                return (
                  <div
                    key={stage.key}
                    style={{ width: `${(count / totalForBar) * 100}%`, background: stage.color, transition: 'width 0.4s ease' }}
                    title={`${stage.label}: ${count}`}
                  />
                );
              })}
            </div>

            {/* Stage Cards Grid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2.5">
              {FUNNEL_STAGES.map(stage => {
                const count = counts[stage.key] || 0;
                const pct = Math.round((count / totalForBar) * 100);
                return (
                  <div
                    key={stage.key}
                    onClick={() => setActiveView && setActiveView('jobTracker')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveView && setActiveView('jobTracker'); } }}
                    style={{
                      background: stage.accentBg,
                      border: `1px solid ${stage.color}22`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="p-3.5 flex flex-col gap-1.5 hover:translate-y-[-2px]"
                    title={`View ${stage.label} jobs`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                      <span className="text-[11px] font-semibold" style={{ color: stage.accentText }}>{stage.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold">{count}</span>
                      <span style={{ color: 'var(--text-muted)' }} className="text-[11px] font-medium">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
