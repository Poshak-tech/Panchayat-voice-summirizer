import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { MeetingsList } from './pages/MeetingsList';
import { MeetingDetails } from './pages/MeetingDetails';
import { AudioUpload } from './pages/AudioUpload';
import { Analytics } from './pages/Analytics';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-400">Loading secure gateway...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <Register onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setActiveTab('meeting-details');
  };

  const renderContent = () => {
    if (activeTab === 'meeting-details' && selectedMeetingId) {
      return (
        <MeetingDetails
          meetingId={selectedMeetingId}
          onBack={() => {
            setSelectedMeetingId(null);
            setActiveTab('meetings');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onSelectMeeting={handleSelectMeeting}
            onNavigateToUpload={() => setActiveTab('upload')}
            onNavigateToMeetings={() => setActiveTab('meetings')}
          />
        );
      case 'meetings':
        return <MeetingsList onSelectMeeting={handleSelectMeeting} />;
      case 'upload':
        return (
          <AudioUpload
            onUploadSuccess={(meetingId) => {
              handleSelectMeeting(meetingId);
            }}
          />
        );
      case 'analytics':
        return <Analytics />;
      default:
        return (
          <Dashboard
            onSelectMeeting={handleSelectMeeting}
            onNavigateToUpload={() => setActiveTab('upload')}
            onNavigateToMeetings={() => setActiveTab('meetings')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedMeetingId(null);
          setActiveTab(tab);
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} />
        <main className="flex-1 overflow-hidden flex flex-col">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
// Remove any unused exports or components
export { App };
