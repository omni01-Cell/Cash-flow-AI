import React, { useState } from 'react';
import { FileWarning, Plane, Star, ArrowRight, Loader2, Sparkles, FileText } from 'lucide-react';
import { generateAdministrativeLetter } from '../services/geminiService';
import { useLanguage } from '../utils/i18n';

export const AdminTools: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [loading, setLoading] = useState(false);

  const tools = [
    {
      id: 'fine',
      title: t('tool.fine'),
      desc: t('tool.fine_desc'),
      icon: FileWarning,
      color: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      id: 'visa',
      title: t('tool.visa'),
      desc: t('tool.visa_desc'),
      icon: Plane,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'review',
      title: t('tool.review'),
      desc: t('tool.review_desc'),
      icon: Star,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  const handleGenerate = async (toolId: string) => {
    if (!context) return;
    setLoading(true);
    setGeneratedResult('');
    
    // Map tool ID to API types
    const typeMap: any = { fine: 'fine', visa: 'visa', review: 'review' };
    
    const result = await generateAdministrativeLetter(typeMap[toolId], context, language);
    setGeneratedResult(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 fade-in max-w-7xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('admin.title')}</h2>
        <p className="text-slate-500 mt-1 text-lg">{t('admin.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setGeneratedResult(''); setContext(''); }}
              className={`text-left p-8 rounded-2xl border transition-all duration-300 group ${
                activeTool === tool.id
                  ? 'border-primary ring-1 ring-primary shadow-lg scale-[1.02] bg-white'
                  : 'border-slate-100 bg-white hover:border-primary/50 hover:shadow-md'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{tool.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {activeTool && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles size={20} />
             </div>
             <h3 className="text-xl font-bold text-slate-900">
               {t('tool.generate')}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('tool.context')}</label>
                <div className="relative">
                  <textarea
                    className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none transition-shadow"
                    placeholder="Décrivez la situation en détail..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                    IA Gemini 2.5
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleGenerate(activeTool)}
                disabled={loading || !context}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center shadow-lg shadow-blue-100 disabled:opacity-70 disabled:shadow-none"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Générer le document <ArrowRight className="ml-2" size={18} /></>}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 relative min-h-[300px]">
              {generatedResult ? (
                <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap font-medium">
                  {generatedResult}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <FileText size={48} className="mb-4 text-slate-300" />
                  <span className="font-medium">Le document apparaîtra ici</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};