import React, { useState } from 'react';
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

const VIEW_METADATA = {
  overview: { title: 'Daily Overview Dashboard', subtitle: 'Personalized strategy tips & 15-10-2 progress metrics' },
  jobTracker: { title: 'Job Application Tracker', subtitle: 'Manage active job postings, application statuses, and networking contacts' },
  paperForm: { title: 'Fillable Paper Form View', subtitle: 'Interactive digital web replica of Form PD10048654 with inline editable cells' },
  master: { title: 'All Contacts & Resources Master Database', subtitle: 'Searchable master list of all recorded contacts, resources, and meetings' },
  contacts: { title: 'Contacts Made (Goal: 10)', subtitle: 'Log daily outreach with automatic follow-up calculations' },
  meetings: { title: 'Face-to-Face Meetings (Goal: 2)', subtitle: 'Track informational & job interviews with follow-up dates' },
  resources: { title: 'Resources Identified (Goal: 15)', subtitle: 'Identify companies, networking directories, and industry lists' },
  targets: { title: 'Target Companies & Sectors', subtitle: 'Manage primary organizations targeted for applications & outreach' },
  history: { title: 'Activity History Log', subtitle: 'Chronological timeline of all daily activities & past updates' },
  inbox: { title: 'Email Interaction Analyzer', subtitle: 'Forward emails to automatically extract contacts & follow-up tasks' },
  atsMatcher: { title: 'ATS Resume Matcher', subtitle: 'Instant feedback on your resume compared to job descriptions using Gemini API' },
  settings: { title: 'Personal Profile & API Configuration', subtitle: 'Manage your contact details, target roles, and secure API keys' }
};

function AppContent() {
  const [activeView, setActiveView] = useState('overview');
  const [isAccountabilityOpen, setIsAccountabilityOpen] = useState(false);
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);

  const currentMeta = VIEW_METADATA[activeView] || VIEW_METADATA.overview;

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard setActiveView={setActiveView} />;
      case 'jobTracker':
        return <JobTrackerView setActiveView={setActiveView} />;
      case 'paperForm':
        return <FillablePaperFormView />;
      case 'master':
        return <AllMasterView />;
      case 'contacts':
        return <ContactFormTable />;
      case 'meetings':
        return <MeetingFormTable />;
      case 'resources':
        return <ResourceTracker />;
      case 'targets':
        return <TargetCompanyList />;
      case 'history':
        return <ActivityHistoryLog />;
      case 'inbox':
        return <PseudoEmailInbox />;
      case 'atsMatcher':
        return <AtsMatcher />;
      case 'settings':
        return <Settings />;
      default:
        return <OverviewDashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="main-panel">
        {/* Top Action Toolbar with clear labels */}
        <TopToolbar
          viewTitle={currentMeta.title}
          viewSubtitle={currentMeta.subtitle}
          onOpenBrainDump={() => setIsBrainDumpOpen(true)}
          onOpenAccountability={() => setIsAccountabilityOpen(true)}
        />

        {/* Dynamic View Content */}
        {renderActiveView()}
      </main>

      {/* Modals & Floating Undo Toast */}
      <AccountabilityModal
        isOpen={isAccountabilityOpen}
        onClose={() => setIsAccountabilityOpen(false)}
      />

      <BrainDumpModal
        isOpen={isBrainDumpOpen}
        onClose={() => setIsBrainDumpOpen(false)}
      />

      {/* Undo Delete Toast Notification with 5s timer */}
      <UndoToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <AppContent />
    </TrackerProvider>
  );
}
