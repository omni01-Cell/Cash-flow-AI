import React from 'react';
import { LayoutDashboard, FileText, ShieldAlert, Settings, Scale, User, LogOut, Menu } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isCollapsed, toggleSidebar }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'invoices', label: t('nav.recovery'), icon: FileText },
    { id: 'admin', label: t('nav.admin'), icon: ShieldAlert },
    { id: 'compliance', label: t('nav.compliance'), icon: Scale },
    { id: 'account', label: t('nav.account'), icon: User },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 h-full z-10 transition-all duration-300`}>
      <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 whitespace-nowrap">
              {t('app.name')}
            </h1>
            <p className="text-xs text-slate-400 mt-1 whitespace-nowrap">Zero-Employee SaaS</p>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          aria-label="Toggle Sidebar"
        >
           <Menu size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className="min-w-[20px]" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <button 
            onClick={onLogout}
            title={isCollapsed ? t('nav.logout') : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-4'} py-2 text-slate-400 hover:text-red-400 transition-colors`}
        >
            <LogOut size={18} className="min-w-[18px]" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{t('nav.logout')}</span>}
        </button>

        <button 
          onClick={() => setActiveTab('account')}
          title={isCollapsed ? 'Jean Solo - Pro Plan' : ''}
          className={`w-full bg-slate-800/50 rounded-lg p-3 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} hover:bg-slate-800 transition-colors text-left`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">
            JS
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white whitespace-nowrap">Jean Solo</p>
              <p className="text-xs text-slate-400 whitespace-nowrap">Pro Plan</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};