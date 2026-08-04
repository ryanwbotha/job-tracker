import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Target, LayoutDashboard, Database, Users, Video, Compass, Building2, History, MailCheck, FileText, Briefcase, Sparkles, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }) {
  const { resources, contacts, meetings, allResources } = useTracker();

  const jobCount = (allResources || []).filter(r => r.category === 'Job Application').length;

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'jobTracker', label: 'Job Tracker', icon: Briefcase, count: jobCount },
    { id: 'atsMatcher', label: 'ATS Resume Matcher', icon: Sparkles },
    { id: 'paperForm', label: 'Fillable Paper Form', icon: FileText },
    { id: 'master', label: 'All Contacts & Resources', icon: Database },
    { id: 'contacts', label: 'Contacts Made', icon: Users, count: contacts.length, target: 10 },
    { id: 'meetings', label: 'Face-to-Face Meetings', icon: Video, count: meetings.length, target: 2 },
    { id: 'resources', label: 'Resources Identified', icon: Compass, count: resources.length, target: 15 },
    { id: 'targets', label: 'Target Companies', icon: Building2 },
    { id: 'history', label: 'Activity History', icon: History },
    { id: 'inbox', label: 'Email Tracker', icon: MailCheck },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Target size={22} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>15-10-2 Practice</h2>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Daily Activity Tracker</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={18} color={isActive ? '#ffffff' : 'var(--text-secondary)'} />
                <span>{item.label}</span>
              </div>

              {item.count !== undefined && (
                <span className={`badge ${item.target && item.count >= item.target ? 'badge-emerald' : 'badge-blue'}`}>
                  {item.count}{item.target ? `/${item.target}` : ''}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
