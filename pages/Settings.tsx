import React from 'react';
import { Globe, Bell, Key, ChevronRight } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('set.title')}</h2>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
        
        {/* Language Section */}
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{t('set.language')}</h3>
              <p className="text-sm text-slate-500">Choisissez la langue de l'interface</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage('fr')}
              className={`flex-1 py-3.5 rounded-xl border font-medium transition flex items-center justify-center gap-2 ${
                language === 'fr' 
                  ? 'bg-primary/5 border-primary text-primary' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3.5 rounded-xl border font-medium transition flex items-center justify-center gap-2 ${
                language === 'en' 
                  ? 'bg-primary/5 border-primary text-primary' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-8">
           <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{t('set.notifications')}</h3>
              <p className="text-sm text-slate-500">Gérez vos alertes et emails</p>
            </div>
          </div>
          <div className="space-y-4">
             <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                <span className="font-medium text-slate-700">Alertes factures impayées</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
             </label>
             <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                <span className="font-medium text-slate-700">Résumé quotidien</span>
                <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
             </label>
          </div>
        </div>

        {/* API */}
        <div className="p-8">
           <div className="flex items-center gap-4 mb-6">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{t('set.api')}</h3>
              <p className="text-sm text-slate-500">Clés API pour les intégrations</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <code className="text-sm text-slate-600 font-mono">
              {process.env.API_KEY ? 'sk-••••••••••••••••••••••••' : 'Non Configurée'}
            </code>
            <button className="text-sm font-bold text-primary hover:underline">
              Gérer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};