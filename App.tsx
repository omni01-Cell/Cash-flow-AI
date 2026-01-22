import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Recovery } from './pages/Recovery';
import { AdminTools } from './pages/AdminTools';
import { Compliance } from './pages/Compliance';
import { SettingsPage } from './pages/Settings';
import { AccountPage } from './pages/Account';
import { LandingPage } from './components/LandingPage';
import { Auth } from './pages/Auth';
import { ChatBot } from './components/ChatBot';
import { LanguageProvider } from './utils/i18n';
import { UserProfile } from './types';
import { supabase } from './services/supabaseClient';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [publicView, setPublicView] = useState<'landing' | 'auth'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    plan: 'Starter',
    avatar: null
  });

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setPublicView('landing');
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setUserProfile({
          name: data.name || 'User',
          email: data.email || '',
          plan: data.plan || 'Starter',
          avatar: data.avatar_url || null
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    if (!session?.user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          name: newProfile.name,
          plan: newProfile.plan,
          avatar_url: newProfile.avatar,
          // email is handled by auth, usually shouldn't change here without re-auth, 
          // but we can update the display email
        });

      if (error) throw error;
      setUserProfile(newProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Unauthenticated Routing
  if (!session) {
    if (publicView === 'auth') {
      return (
        <Auth 
          onLogin={() => {}} // Handled by onAuthStateChange
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
        return <Dashboard userId={session?.user?.id || ''} />;
      case 'invoices':
        return <Recovery userId={session?.user?.id || ''} />;
      case 'admin':
        return <AdminTools />;
      case 'compliance':
        return <Compliance />;
      case 'settings':
        return <SettingsPage />;
      case 'account':
        return <AccountPage userProfile={userProfile} onUpdateProfile={updateProfile} />;
      default:
        return <Dashboard userId={session?.user?.id || ''} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => supabase.auth.signOut()}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userProfile={userProfile}
      />
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex-1 p-8 h-screen overflow-y-auto`}>
        {renderContent()}
      </main>
      
      {/* AI Assistant Chatbot */}
      <ChatBot />
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