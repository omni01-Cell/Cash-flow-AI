import React from 'react';
import { ShieldCheck, Scale, Banknote } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const Compliance: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{t('comp.title')}</h2>
        <p className="text-slate-500 text-lg">Transparence, sécurité et cadre légal de notre activité.</p>
      </header>

      <div className="grid gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Scale size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('comp.legal_status')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('comp.legal_text')}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Banknote size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('comp.funds')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('comp.funds_text')}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
             <ShieldCheck size={32} />
          </div>
           <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">RGPD & Confidentialité</h3>
            <p className="text-slate-600 leading-relaxed">
              Toutes les données traitées sont chiffrées (AES-256). Nous n'utilisons vos données que pour fournir le service d'automatisation. Aucune donnée n'est revendue à des tiers. Conformité RGPD totale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};