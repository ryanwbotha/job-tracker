import React from 'react';
import { useTracker } from '../context/TrackerContext';
import DailyProgressCard from './DailyProgressCard';
import DailyStrategyCoach from './DailyStrategyCoach';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function OverviewDashboard({ setActiveView }) {
  const { allResources } = useTracker();
  
  // Filter for Job Applications
  const jobApplications = (allResources || []).filter(res => res.category === 'Job Application');
  
  // Calculate pipeline stats
  const wishlistCount = jobApplications.filter(j => (j.status || 'Wishlist') === 'Wishlist').length;
  const appliedCount = jobApplications.filter(j => j.status === 'Applied').length;
  const interviewingCount = jobApplications.filter(j => j.status === 'Interviewing').length;
  const offerCount = jobApplications.filter(j => j.status === 'Offer').length;
  const rejectedCount = jobApplications.filter(j => j.status === 'Rejected').length;
  
  const totalJobs = jobApplications.length;
  const totalActive = totalJobs - rejectedCount;

  // Percentage calculations
  const totalForBar = totalJobs || 1;
  const wishlistPercent = (wishlistCount / totalForBar) * 100;
  const appliedPercent = (appliedCount / totalForBar) * 100;
  const interviewingPercent = (interviewingCount / totalForBar) * 100;
  const offerPercent = (offerCount / totalForBar) * 100;
  const rejectedPercent = (rejectedCount / totalForBar) * 100;

  const funnelCards = [
    { label: 'Jobs', count: wishlistCount, color: '#cbd5e1', bgColor: 'rgba(203, 213, 225, 0.04)', borderColor: 'rgba(203, 213, 225, 0.15)' },
    { label: 'Applied', count: appliedCount, color: 'var(--accent-amber)', bgColor: 'rgba(245, 158, 11, 0.03)', borderColor: 'rgba(245, 158, 11, 0.08)' },
    { label: 'Interviewing', count: interviewingCount, color: 'var(--accent-purple)', bgColor: 'rgba(139, 92, 246, 0.03)', borderColor: 'rgba(139, 92, 246, 0.08)' },
    { label: 'Offer', count: offerCount, color: 'var(--accent-emerald)', bgColor: 'rgba(16, 185, 129, 0.03)', borderColor: 'rgba(16, 185, 129, 0.08)' },
    { label: 'Rejected', count: rejectedCount, color: 'var(--accent-rose)', bgColor: 'rgba(244, 63, 94, 0.03)', borderColor: 'rgba(244, 63, 94, 0.08)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* AI Strategy Coach Banner */}
      <DailyStrategyCoach />

      {/* 15-10-2 Daily Goal Progress Cards (Clickable Navigation Targets) */}
      <DailyProgressCard setActiveView={setActiveView} />

      {/* Job Search Funnel Widget */}
      <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={22} color="var(--accent-blue)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Job Search Funnel</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Track your progress from discovery to final job offer ({totalActive} active applications)
              </p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveView && setActiveView('jobTracker')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minHeight: '32px', fontSize: '0.75rem', padding: '0 0.65rem' }}
          >
            <span>Open Tracker</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {totalJobs === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'rgba(0,0,0,0.01)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No jobs tracked yet</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Go to Job Tracker to log your first job application.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Visual Stacked Progress Funnel Bar */}
            <div style={{ display: 'flex', height: '14px', borderRadius: '9999px', overflow: 'hidden', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)' }}>
              {wishlistCount > 0 && <div style={{ width: `${wishlistPercent}%`, background: '#cbd5e1', transition: 'width 0.3s ease' }} title={`Jobs: ${wishlistCount}`} />}
              {appliedCount > 0 && <div style={{ width: `${appliedPercent}%`, background: 'var(--accent-amber)', transition: 'width 0.3s ease' }} title={`Applied: ${appliedCount}`} />}
              {interviewingCount > 0 && <div style={{ width: `${interviewingPercent}%`, background: 'var(--accent-purple)', transition: 'width 0.3s ease' }} title={`Interviewing: ${interviewingCount}`} />}
              {offerCount > 0 && <div style={{ width: `${offerPercent}%`, background: 'var(--accent-emerald)', transition: 'width 0.3s ease' }} title={`Offer: ${offerCount}`} />}
              {rejectedCount > 0 && <div style={{ width: `${rejectedPercent}%`, background: 'var(--accent-rose)', transition: 'width 0.3s ease' }} title={`Rejected: ${rejectedCount}`} />}
            </div>

            {/* Funnel Stage Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {funnelCards.map(card => (
                <div
                  key={card.label}
                  onClick={() => setActiveView && setActiveView('jobTracker')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && setActiveView) {
                      e.preventDefault();
                      setActiveView('jobTracker');
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: card.bgColor,
                    border: `1px solid ${card.borderColor}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = card.color;
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = card.borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title={`Click to view ${card.label} in Job Tracker`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.color }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{card.label}</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                    {card.count}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ({Math.round((card.count / totalForBar) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
