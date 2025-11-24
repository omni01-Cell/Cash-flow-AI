import React from 'react';
import { ShieldCheck, Scale, Banknote } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const Compliance: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('comp.title')}</h2>
        <p className="text-slate-500">Transparence et cadre légal de notre activité.</p>
      </header>

      <div className="grid gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg mt-1">
            <Scale size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('comp.legal_status')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('comp.legal_text')}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg mt-1">
            <Banknote size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('comp.funds')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('comp.funds_text')}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg mt-1">
             <ShieldCheck size={24} />
          </div>
           <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">GDPR & Data Privacy</h3>
            <p className="text-slate-600 leading-relaxed">
              Toutes les données traitées sont chiffrées. Nous n'utilisons vos données que pour fournir le service d'automatisation. Aucune donnée n'est revendue à des tiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};