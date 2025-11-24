import React from 'react';
import { User, CreditCard } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const AccountPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('acc.title')}</h2>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
          <User size={40} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Jean Solopreneur</h3>
          <p className="text-slate-500">jean@example.com</p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            Active
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={18} /> {t('acc.plan')}
          </h3>
        </div>
        <div className="p-6">
           <div className="flex justify-between items-center mb-4">
             <span className="text-lg font-medium text-slate-700">Pro Plan</span>
             <span className="text-2xl font-bold text-indigo-600">29€<span className="text-sm text-slate-400 font-normal">/mo</span></span>
           </div>
           <p className="text-sm text-slate-500 mb-6">Renouvellement le 24 Mai 2025</p>
           <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
             <div className="bg-indigo-600 h-2 rounded-full" style={{width: '65%'}}></div>
           </div>
           <p className="text-xs text-right text-slate-400">65% {t('acc.usage')}</p>
        </div>
      </div>
    </div>
  );
};