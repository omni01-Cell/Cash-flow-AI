import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Recovery } from './pages/Recovery';
import { AdminTools } from './pages/AdminTools';
import { Compliance } from './pages/Compliance';
import { SettingsPage } from './pages/Settings';
import { AccountPage } from './pages/Account';
import { LandingPage } from './components/LandingPage';
import { Auth } from './pages/Auth';
import { LanguageProvider } from './utils/i18n';
import { UserProfile } from './types';

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicView, setPublicView] = useState<'landing' | 'auth'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Jean Solo',
    email: 'jean@example.com',
    plan: 'Pro Plan',
    avatar: null
  });

  // Unauthenticated Routing
  if (!isLoggedIn) {
    if (publicView === 'auth') {
      return (
        <Auth 
          onLogin={() => setIsLoggedIn(true)} 
          onBack={() => setPublicView('landing')} 
        />
      );
    }
    return (
      <LandingPage 
        onNavigateToAuth={() => setPublicView('auth')} 
      />
    );
  }

  // Authenticated Routing
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoices':
        return <Recovery />;
      case 'admin':
        return <AdminTools />;
      case 'compliance':
        return <Compliance />;
      case 'settings':
        return <SettingsPage />;
      case 'account':
        return <AccountPage userProfile={userProfile} onUpdateProfile={setUserProfile} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => {
          setIsLoggedIn(false);
          setPublicView('landing');
        }}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userProfile={userProfile}
      />
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-8 h-screen overflow-y-auto`}>
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;