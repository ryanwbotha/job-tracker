import React, { useState, useEffect } from 'react';
import { TrackerProvider } from './context/TrackerContext';
import Sidebar from './components/Sidebar';
import TopToolbar from './components/TopToolbar';
import OverviewDashboard from './components/OverviewDashboard';
import FillablePaperFormView from './components/FillablePaperFormView';
import AllMasterView from './components/AllMasterView';
import ContactFormTable from './components/ContactFormTable';
import MeetingFormTable from './components/MeetingFormTable';
import ResourceTracker from './components/ResourceTracker';
import TargetCompanyList from './components/TargetCompanyList';
import ActivityHistoryLog from './components/ActivityHistoryLog';
import PseudoEmailInbox from './components/PseudoEmailInbox';
import AccountabilityModal from './components/AccountabilityModal';
import BrainDumpModal from './components/BrainDumpModal';
import UndoToastNotification from './components/UndoToastNotification';
import JobTrackerView from './components/JobTrackerView';
import AtsMatcher from './components/AtsMatcher';
import Settings from './components/Settings';
import Login from './components/Login';
import CavemanLoader from './components/ui/CavemanLoader';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const VIEW_METADATA = {
  overview:   { title: 'Daily Overview Dashboard',                subtitle: 'Personalized strategy tips & 15-10-2 progress metrics' },
  jobTracker: { title: 'Job Application Tracker',                 subtitle: 'Manage active job postings, application statuses, and networking contacts' },
  paperForm:  { title: 'Fillable Paper Form View',                subtitle: 'Interactive digital web replica of Form PD10048654 with inline editable cells' },
  master:     { title: 'All Contacts & Resources Master Database',subtitle: 'Searchable master list of all recorded contacts, resources, and meetings' },
  contacts:   { title: 'Contacts Made (Goal: 10)',                subtitle: 'Log daily outreach with automatic follow-up calculations' },
  meetings:   { title: 'Face-to-Face Meetings (Goal: 2)',         subtitle: 'Track informational & job interviews with follow-up dates' },
  resources:  { title: 'Resources Identified (Goal: 15)',         subtitle: 'Identify companies, networking directories, and industry lists' },
  targets:    { title: 'Target Companies & Sectors',              subtitle: 'Manage primary organizations targeted for applications & outreach' },
  history:    { title: 'Activity History Log',                    subtitle: 'Chronological timeline of all daily activities & past updates' },
  inbox:      { title: 'Email Interaction Analyzer',             subtitle: 'Forward emails to automatically extract contacts & follow-up tasks' },
  atsMatcher: { title: 'ATS Resume Matcher',                     subtitle: 'Instant feedback on your resume compared to job descriptions using Gemini API' },
  settings:   { title: 'Personal Profile & API Configuration',   subtitle: 'Manage your contact details, target roles, and secure API keys' }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-destructive/10 border-2 border-destructive rounded-xl text-foreground flex flex-col gap-4">
          <h2 className="text-xl font-bold text-destructive">⚠️ Component Render Error</h2>
          <p className="font-mono text-sm bg-background p-3 rounded border border-border text-destructive">
            {this.state.error && this.state.error.toString()}
          </p>
          <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-auto max-h-60 text-muted-foreground whitespace-pre-wrap">
            {this.state.errorInfo?.componentStack || this.state.error?.stack}
          </pre>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md self-start cursor-pointer hover:bg-primary/90"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Retry View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [activeView, setActiveView] = useState('overview');
  const [isAccountabilityOpen, setIsAccountabilityOpen] = useState(false);
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);

  const currentMeta = VIEW_METADATA[activeView] || VIEW_METADATA.overview;

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':   return <OverviewDashboard setActiveView={setActiveView} />;
      case 'jobTracker': return <JobTrackerView setActiveView={setActiveView} />;
      case 'paperForm':  return <FillablePaperFormView />;
      case 'master':     return <AllMasterView />;
      case 'contacts':   return <ContactFormTable />;
      case 'meetings':   return <MeetingFormTable />;
      case 'resources':  return <ResourceTracker />;
      case 'targets':    return <TargetCompanyList />;
      case 'history':    return <ActivityHistoryLog />;
      case 'inbox':      return <PseudoEmailInbox />;
      case 'atsMatcher': return <AtsMatcher />;
      case 'settings':   return <Settings />;
      default:           return <OverviewDashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[240px_1fr] max-[900px]:grid-cols-1 max-w-[1720px] mx-auto min-h-screen">
        {/* Left Navigation Sidebar */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content Area */}
        <main className="flex flex-col gap-5 px-5 md:px-6 py-6 w-full min-w-0 bg-background text-foreground">
          {/* Top Action Toolbar */}
          <TopToolbar
            viewTitle={currentMeta.title}
            viewSubtitle={currentMeta.subtitle}
            onOpenBrainDump={() => setIsBrainDumpOpen(true)}
            onOpenAccountability={() => setIsAccountabilityOpen(true)}
          />

          {/* Dynamic View Content */}
          <div className="animate-fadeIn w-full">
            <ErrorBoundary key={activeView}>
              {renderActiveView()}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AccountabilityModal
        isOpen={isAccountabilityOpen}
        onClose={() => setIsAccountabilityOpen(false)}
      />
      <BrainDumpModal
        isOpen={isBrainDumpOpen}
        onClose={() => setIsBrainDumpOpen(false)}
      />

      {/* Undo Toast */}
      <UndoToastNotification />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <CavemanLoader />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <TrackerProvider user={user}>
      <AppContent />
    </TrackerProvider>
  );
}
