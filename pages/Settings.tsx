import React from 'react';
import { Globe, Bell, Key } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('set.title')}</h2>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Language Section */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-slate-900">{t('set.language')}</h3>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage('fr')}
              className={`flex-1 py-3 rounded-lg border font-medium transition ${
                language === 'fr' 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-lg border font-medium transition ${
                language === 'en' 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 border-b border-slate-100">
           <div className="flex items-center gap-3 mb-4">
            <Bell className="text-amber-600" size={20} />
            <h3 className="font-semibold text-slate-900">{t('set.notifications')}</h3>
          </div>
          <div className="space-y-3">
             <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600">Email alerts for overdue invoices</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
             </label>
             <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600">Daily summary</span>
                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
             </label>
          </div>
        </div>

        {/* API */}
        <div className="p-6">
           <div className="flex items-center gap-3 mb-4">
            <Key className="text-slate-600" size={20} />
            <h3 className="font-semibold text-slate-900">{t('set.api')}</h3>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <p className="text-xs text-slate-500 break-all font-mono">
              API_KEY: {process.env.API_KEY ? '••••••••••••••••' : 'Not Configured'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};