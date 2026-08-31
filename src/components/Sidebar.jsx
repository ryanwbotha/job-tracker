import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Crosshair, SquaresFour, Database, Users, VideoCamera, Compass,
  Buildings, ClockCounterClockwise, EnvelopeSimple, FileText, Briefcase, Sparkle,
  Gear, Sun, Moon, SignOut, List, X
} from '@phosphor-icons/react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem('jst-theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

export default function Sidebar({ activeView, setActiveView }) {
  const { resources, contacts, meetings, allResources } = useTracker();
  const { theme, toggle } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const jobCount = (allResources || []).filter(r => r.category === 'Job Application').length;

  const navGroups = [
    {
      label: '',
      items: [
        { id: 'overview',    label: 'Overview',        icon: SquaresFour },
      ]
    },
    {
      label: 'Daily 15-10-2',
      items: [
        { id: 'resources',   label: 'Resources',       icon: Compass,    count: resources.length, target: 15 },
        { id: 'contacts',    label: 'Contacts',        icon: Users,      count: contacts.length,  target: 10 },
        { id: 'meetings',    label: 'Meetings',        icon: VideoCamera,      count: meetings.length,  target: 2 },
      ]
    },
    {
      label: 'Main',
      items: [
        { id: 'jobTracker',  label: 'Job Tracker',     icon: Briefcase,  count: jobCount },
        { id: 'atsMatcher',  label: 'ATS Matcher',     icon: Sparkle },
        { id: 'targets',     label: 'Target Companies',icon: Buildings },
        { id: 'paperForm',   label: 'Paper Form',      icon: FileText },
      ]
    },
    {
      label: 'Records',
      items: [
        { id: 'master',      label: 'Master Database', icon: Database },
        { id: 'history',     label: 'Activity History',icon: ClockCounterClockwise },
        { id: 'inbox',       label: 'Email Tracker',   icon: EnvelopeSimple },
      ]
    },
  ];

  const renderNavList = () => (
    <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6">
      {navGroups.map((group, idx) => (
        <div key={group.label || idx}>
          {group.label && (
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-1">
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const metGoal = item.target && item.count >= item.target;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-between min-h-[40px] px-4 py-2.5 ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileOpen(false);
                  }}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} className="shrink-0" weight={isActive ? "fill" : "regular"} />
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.count !== undefined && (
                    <Badge 
                      variant={metGoal ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0 rounded-sm ml-2 shrink-0 h-4"
                    >
                      {item.count}{item.target ? `/${item.target}` : ''}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const renderFooter = () => (
    <div className="flex items-center justify-between px-4 py-4 gap-2 border-t border-sidebar-border">
      <Button
        variant={activeView === 'settings' ? "secondary" : "ghost"}
        className={`flex-1 justify-start gap-3 min-h-[40px] px-3.5 py-2 ${activeView === 'settings' ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
        onClick={() => {
          setActiveView('settings');
          setIsMobileOpen(false);
        }}
      >
        <Gear size={16} weight={activeView === 'settings' ? "fill" : "regular"} />
        Settings
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-10 h-10 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={toggle}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="w-10 h-10 shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
        onClick={() => signOut(auth)}
        title="Sign out of your cave"
      >
        <SignOut size={16} />
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible min-width 900px) */}
      <aside className="hidden min-[900px]:flex h-screen w-[240px] shrink-0 flex-col sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-colors duration-200 ease-in-out">
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-xs bg-primary text-primary-foreground">
              <Crosshair size={18} color="currentColor" weight="bold" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-foreground">WhatsNext</p>
              <p className="text-[11px] mt-0.5 font-medium text-muted-foreground">Job Search Tracker</p>
            </div>
          </div>
        </div>

        {renderNavList()}
        {renderFooter()}
      </aside>

      {/* Mobile Top Header + Sheet Drawer */}
      <div className="min-[900px]:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-sidebar text-sidebar-foreground border-b border-sidebar-border w-full">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-primary text-primary-foreground">
            <Crosshair size={16} color="currentColor" weight="bold" />
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight text-foreground">WhatsNext</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground"
          onClick={() => setIsMobileOpen(true)}
        >
          <List size={22} />
        </Button>
      </div>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col justify-between bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <SheetHeader className="p-4 border-b border-sidebar-border text-left">
            <SheetTitle className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-primary text-primary-foreground">
                <Crosshair size={16} color="currentColor" weight="bold" />
              </span>
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground">WhatsNext</p>
                <p className="text-[11px] font-normal text-muted-foreground">Navigation</p>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {renderNavList()}
          </div>
          {renderFooter()}
        </SheetContent>
      </Sheet>
    </>
  );
}

