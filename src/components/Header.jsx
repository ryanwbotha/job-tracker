import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Target, Calendar, Share2, MailCheck, Mic } from 'lucide-react';

export default function Header({ onOpenAccountability, onOpenBrainDump, activeTab, setActiveTab }) {
  const { selectedDate, setSelectedDate } = useTracker();

  return (
    <header className="header-card">
      <div className="header-title-group">
        <div className="header-logo-badge">
          <Target size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Daily Activity Tracker</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            LDS 15-10-2 Job Search Practice • Auto Follow-ups, Voice Notes & Email Tracker
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Calendar size={15} color="var(--accent-blue)" />
          <input
            type="date"
            className="input-field"
            style={{ border: 'none', background: 'transparent', padding: 0, width: 'auto', fontWeight: 600, fontSize: '0.85rem' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Voice Note / Brain Dump button */}
        <button className="btn btn-secondary" onClick={onOpenBrainDump}>
          <Mic size={16} color="var(--accent-purple)" />
          <span>Voice / Text Brain Dump</span>
        </button>

        {/* Email Tracker trigger button */}
        <button
          className={`btn ${activeTab === 'inbox' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab(activeTab === 'inbox' ? 'tracker' : 'inbox')}
        >
          <MailCheck size={16} />
          <span>Email Tracker</span>
        </button>

        {/* Daily Accountability Update Button */}
        <button className="btn btn-emerald" onClick={onOpenAccountability}>
          <Share2 size={16} />
          <span>Accountability Update</span>
        </button>
      </div>
    </header>
  );
}
