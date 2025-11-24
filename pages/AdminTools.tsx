import React, { useState } from 'react';
import { FileWarning, Plane, Star, ArrowRight, Loader2 } from 'lucide-react';
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
      color: 'bg-red-50 text-red-600',
    },
    {
      id: 'visa',
      title: t('tool.visa'),
      desc: t('tool.visa_desc'),
      icon: Plane,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'review',
      title: t('tool.review'),
      desc: t('tool.review_desc'),
      icon: Star,
      color: 'bg-amber-50 text-amber-600',
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
    <div className="space-y-8 fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('admin.title')}</h2>
        <p className="text-slate-500">{t('admin.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setGeneratedResult(''); setContext(''); }}
              className={`text-left p-6 rounded-xl border transition-all ${
                activeTool === tool.id
                  ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md bg-white'
                  : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-500">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {activeTool && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
             {t('tool.generate')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">{t('tool.context')}</label>
              <textarea
                className="w-full h-40 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <button
                onClick={() => handleGenerate(activeTool)}
                disabled={loading || !context}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Generate <ArrowRight className="ml-2" size={18} /></>}
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 relative min-h-[200px]">
              {generatedResult ? (
                <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap">
                  {generatedResult}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm italic">
                  AI Result...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};