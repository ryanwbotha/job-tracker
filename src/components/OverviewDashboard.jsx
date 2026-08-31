import React from 'react';
import { useTracker } from '../context/TrackerContext';
import DailyProgressCard from './DailyProgressCard';
import DailyStrategyCoach from './DailyStrategyCoach';
import { Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

const FUNNEL_STAGES = [
  { key: 'Wishlist',     label: 'Wishlist',      color: '#64748b', accentBg: 'rgba(100,116,139,0.12)', accentText: 'var(--muted-foreground)' },
  { key: 'Applied',      label: 'Applied',       color: '#f59e0b', accentBg: 'rgba(245,158,11,0.12)',  accentText: 'var(--foreground)' },
  { key: 'Interviewing', label: 'Interviewing',  color: '#8b5cf6', accentBg: 'rgba(139,92,246,0.12)',  accentText: 'var(--foreground)' },
  { key: 'Offer',        label: 'Offer',         color: '#10b981', accentBg: 'rgba(16,185,129,0.12)',  accentText: 'var(--foreground)' },
  { key: 'Rejected',     label: 'Rejected',      color: '#f43f5e', accentBg: 'rgba(244,63,94,0.12)',   accentText: 'var(--muted-foreground)' },
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
      {/* 15-10-2 Daily Goal Progress Cards */}
      <DailyProgressCard setActiveView={setActiveView} />

      {/* AI Strategy Coach Banner */}
      <DailyStrategyCoach />

      {/* Job Search Funnel Widget */}
      <Card className="p-5 md:p-6 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary"
            >
              <TrendingUp size={17} />
            </div>
            <div>
              <h3 className="text-[0.9375rem] font-semibold leading-tight text-foreground">
                Job Search Funnel
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalActive} active · {totalJobs} total tracked
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setActiveView && setActiveView('jobTracker')}
          >
            Open Tracker
            <ArrowRight size={11} />
          </Button>
        </div>

        {/* Empty state */}
        {totalJobs === 0 ? (
          <div
            className="py-10 flex flex-col items-center gap-1 text-center bg-muted/30 border border-dashed border-border rounded-lg"
          >
            <Briefcase size={24} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground mt-2">No jobs tracked yet</span>
            <span className="text-xs text-muted-foreground">Go to Job Tracker to log your first application.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stacked Progress Bar */}
            <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-muted p-0.5">
              {FUNNEL_STAGES.map(stage => {
                const count = counts[stage.key] || 0;
                if (!count) return null;
                const percentage = Math.round((count / totalForBar) * 100);
                return (
                  <Progress
                    key={stage.key}
                    value={percentage}
                    max={100}
                    className="h-full flex-1 rounded-none bg-transparent"
                    indicatorClassName="h-full rounded-full"
                    style={{ width: `${percentage}%` }}
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
                      <span className="text-[11px] font-semibold text-foreground">{stage.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{count}</span>
                      <span className="text-[11px] font-medium text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

