import React, { useState, useEffect } from 'react';
import { Globe, Bell, Key, ChevronRight, Eye, EyeOff, Save } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  // Notification State
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [summaryEnabled, setSummaryEnabled] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedAlerts = localStorage.getItem('settings_notifications_alerts');
    const savedSummary = localStorage.getItem('settings_notifications_summary');
    const savedApiKey = localStorage.getItem('gemini_api_key');

    if (savedAlerts !== null) setAlertsEnabled(savedAlerts === 'true');
    if (savedSummary !== null) setSummaryEnabled(savedSummary === 'true');

    if (savedApiKey) {
      setSavedKey(savedApiKey);
      setApiKey(savedApiKey);
    }
  }, []);

  const handleAlertsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAlertsEnabled(checked);
    localStorage.setItem('settings_notifications_alerts', String(checked));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSummaryEnabled(checked);
    localStorage.setItem('settings_notifications_summary', String(checked));
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setSavedKey(apiKey.trim());
      setIsEditingKey(false);
    } else {
      localStorage.removeItem('gemini_api_key');
      setSavedKey(null);
      setIsEditingKey(false);
    }
  };

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
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={handleAlertsChange}
                  className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
                />
             </label>
             <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
                <span className="font-medium text-slate-700">Résumé quotidien</span>
                <input
                  type="checkbox"
                  checked={summaryEnabled}
                  onChange={handleSummaryChange}
                  className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
                />
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

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            {!isEditingKey ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 overflow-hidden">
                   {savedKey ? (
                     <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        <code className="text-sm text-slate-600 font-mono truncate">
                           sk-••••••••{savedKey.slice(-4)}
                        </code>
                     </>
                   ) : process.env.API_KEY ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                        <code className="text-sm text-slate-600 font-mono truncate">
                           Clé système par défaut
                        </code>
                      </>
                   ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                        <code className="text-sm text-slate-600 font-mono italic">
                           Aucune clé configurée
                        </code>
                      </>
                   )}
                </div>
                <button
                  onClick={() => setIsEditingKey(true)}
                  className="text-sm font-bold text-primary hover:underline whitespace-nowrap ml-4"
                >
                  {savedKey ? 'Modifier' : 'Configurer'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                 <div className="relative">
                   <input
                     type={showKey ? "text" : "password"}
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     placeholder="sk-..."
                     className="w-full pr-10 pl-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                   />
                   <button
                     onClick={() => setShowKey(!showKey)}
                     className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                   >
                     {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                   </button>
                 </div>
                 <div className="flex justify-end gap-2">
                   <button
                     onClick={() => {
                        setIsEditingKey(false);
                        setApiKey(savedKey || '');
                     }}
                     className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
                   >
                     Annuler
                   </button>
                   <button
                     onClick={handleSaveApiKey}
                     className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                   >
                     <Save size={12} /> Enregistrer
                   </button>
                 </div>
              </div>
            )}
             <p className="mt-2 text-xs text-slate-400">
               Votre clé est stockée localement dans votre navigateur et n'est jamais envoyée à nos serveurs.
               {process.env.API_KEY && !savedKey && " Une clé système est actuellement active."}
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};
