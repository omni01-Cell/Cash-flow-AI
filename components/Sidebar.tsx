import React from 'react';
import { LayoutDashboard, FileText, ShieldAlert, Settings, Scale, User, LogOut, Menu } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  userProfile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isCollapsed, toggleSidebar, userProfile }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'invoices', label: t('nav.recovery'), icon: FileText },
    { id: 'admin', label: t('nav.admin'), icon: ShieldAlert },
    { id: 'compliance', label: t('nav.compliance'), icon: Scale },
    { id: 'account', label: t('nav.account'), icon: User },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const initials = userProfile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-secondary text-white min-h-screen flex flex-col fixed left-0 top-0 h-full z-20 transition-all duration-300 shadow-xl border-r border-white/5`}>
      {/* Header */}
      <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-white/5`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">
                Cash-flow <span className="text-primary">AI</span>
              </h1>
            </div>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className={`text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isCollapsed ? '' : ''}`}
          aria-label="Toggle Sidebar"
        >
           <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={`min-w-[20px] transition-colors ${isActive ? 'text-white' : 'group-hover:text-accent'}`} />
              {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
              
              {/* Active Indicator Strip */}
              {isActive && !isCollapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-l-full hidden"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-3 bg-black/20">
        <button 
            onClick={onLogout}
            title={isCollapsed ? t('nav.logout') : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5`}
        >
            <LogOut size={18} className="min-w-[18px]" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{t('nav.logout')}</span>}
        </button>

        <button 
          onClick={() => setActiveTab('account')}
          title={isCollapsed ? `${userProfile.name} - ${userProfile.plan}` : ''}
          className={`w-full bg-white/5 rounded-xl p-3 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} hover:bg-white/10 transition-all text-left border border-white/5 group`}
        >
          {userProfile.avatar ? (
             <img src={userProfile.avatar} alt={userProfile.name} className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-primary/50" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg">
              {initials}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-semibold text-white whitespace-nowrap truncate group-hover:text-accent transition-colors">{userProfile.name}</p>
              <p className="text-xs text-slate-400 whitespace-nowrap truncate">{userProfile.plan}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};