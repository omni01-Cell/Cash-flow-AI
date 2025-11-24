import React from 'react';
import { ArrowRight, CheckCircle, Shield, Zap, FileText } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const LandingPage: React.FC<{ onNavigateToAuth: () => void }> = ({ onNavigateToAuth }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans fade-in">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {t('app.name')}
        </div>
        <button 
          onClick={onNavigateToAuth}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition font-medium"
        >
          Connexion
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-16 mb-24">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl leading-tight">
          {t('land.hero_title')}
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl">
          {t('land.hero_sub')}
        </p>
        <button 
          onClick={onNavigateToAuth}
          className="group bg-slate-900 text-white text-lg px-8 py-4 rounded-full hover:bg-slate-800 transition shadow-xl hover:shadow-2xl flex items-center"
        >
          {t('land.cta')}
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Features */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('land.feat1')}</h3>
            <p className="text-slate-500">Dunning workflows powered by Gemini AI that treat your clients with empathy and firmness.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('land.feat2')}</h3>
            <p className="text-slate-500">Generate complex administrative letters (visa, fines) in seconds.</p>
          </div>
           <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t('land.feat3')}</h3>
            <p className="text-slate-500">GDPR compliant. We don't touch your money. Direct payments to your IBAN.</p>
          </div>
        </div>
      </div>

      <footer className="py-12 text-center text-slate-400 text-sm">
        &copy; 2024 Cash-flow AI. All rights reserved.
      </footer>
    </div>
  );
};