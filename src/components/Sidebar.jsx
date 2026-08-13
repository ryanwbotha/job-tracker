import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Target, LayoutDashboard, Database, Users, Video, Compass,
  Building2, History, MailCheck, FileText, Briefcase, Sparkles,
  Settings as SettingsIcon, Sun, Moon, LogOut
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('jst-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('jst-theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

export default function Sidebar({ activeView, setActiveView }) {
  const { resources, contacts, meetings, allResources } = useTracker();
  const { theme, toggle } = useTheme();

  const jobCount = (allResources || []).filter(r => r.category === 'Job Application').length;

  const navGroups = [
    {
      label: 'Main',
      items: [
        { id: 'overview',    label: 'Overview',        icon: LayoutDashboard },
        { id: 'jobTracker',  label: 'Job Tracker',     icon: Briefcase,  count: jobCount },
        { id: 'atsMatcher',  label: 'ATS Matcher',     icon: Sparkles },
      ]
    },
    {
      label: 'Daily 15-10-2',
      items: [
        { id: 'resources',   label: 'Resources',       icon: Compass,    count: resources.length, target: 15 },
        { id: 'contacts',    label: 'Contacts',        icon: Users,      count: contacts.length,  target: 10 },
        { id: 'meetings',    label: 'Meetings',        icon: Video,      count: meetings.length,  target: 2 },
      ]
    },
    {
      label: 'Records',
      items: [
        { id: 'master',      label: 'Master Database', icon: Database },
        { id: 'targets',     label: 'Target Companies',icon: Building2 },
        { id: 'history',     label: 'Activity History',icon: History },
        { id: 'inbox',       label: 'Email Tracker',   icon: MailCheck },
        { id: 'paperForm',   label: 'Paper Form',      icon: FileText },
      ]
    },
  ];

  return (
    <aside
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        transition: 'background 0.2s ease',
      }}
      className="flex h-screen w-[240px] shrink-0 flex-col max-[900px]:h-auto max-[900px]:w-full sticky top-0"
    >
      {/* Brand */}
      <div
        style={{ borderBottom: '1px solid var(--border)' }}
        className="flex items-center gap-3.5 px-5 py-5"
      >
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
        >
          <Target size={18} color="#fff" />
        </span>
        <div>
          <p style={{ color: 'var(--text-primary)' }} className="text-sm font-bold tracking-tight">WhatsNext</p>
          <p style={{ color: 'var(--text-muted)' }} className="text-[11px] mt-0.5 font-medium">Job Search Tracker</p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6">
        {navGroups.map(group => (
          <div key={group.label}>
            <p
              style={{ color: 'var(--text-muted)' }}
              className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider"
            >
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const metGoal = item.target && item.count >= item.target;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    style={isActive ? {
                      background: 'var(--sidebar-active-bg)',
                      color: 'var(--sidebar-active-text)',
                      boxShadow: 'inset 3px 0 0 var(--sidebar-active-border)',
                    } : {
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                    }}
                    className={`flex w-full items-center justify-between min-h-[40px] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer border-none text-left ${
                      !isActive ? 'hover:!bg-[var(--bg-elevated)] hover:!text-[var(--text-primary)]' : ''
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>

                    {item.count !== undefined && (
                      <span
                        style={metGoal
                          ? { background: 'var(--badge-emerald-bg)', color: 'var(--badge-emerald-text)' }
                          : { background: 'var(--badge-slate-bg)',   color: 'var(--badge-slate-text)' }
                        }
                        className="badge text-[11px] font-semibold px-2.5 py-0.5 shrink-0 ml-2"
                      >
                        {item.count}{item.target ? `/${item.target}` : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom bar: Settings + Theme Toggle */}
      <div
        style={{ borderTop: '1px solid var(--border)' }}
        className="flex items-center justify-between px-4 py-4 gap-2"
      >
        <button
          onClick={() => setActiveView('settings')}
          style={{
            color: activeView === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: activeView === 'settings' ? 'var(--bg-elevated)' : 'transparent',
          }}
          className="flex flex-1 items-center gap-3 min-h-[40px] rounded-lg px-3.5 py-2 text-sm font-medium cursor-pointer border-none transition-all hover:!bg-[var(--bg-elevated)] hover:!text-[var(--text-primary)]"
        >
          <SettingsIcon size={16} />
          Settings
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-lg cursor-pointer transition-all hover:!text-[var(--text-primary)]"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut(auth)}
          title="Sign out of your cave"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-lg cursor-pointer transition-all hover:!text-red-500 hover:!border-red-500/30"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
