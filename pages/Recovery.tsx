import React, { useState } from 'react';
import { Upload, FileText, Send, Loader2, Check, ArrowRight, Download } from 'lucide-react';
import { analyzeInvoiceText, generateDunningSequence } from '../services/geminiService';
import { Invoice, DunningDraft, InvoiceStatus } from '../types';
import { useLanguage } from '../utils/i18n';

export const Recovery: React.FC = () => {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedInvoice, setAnalyzedInvoice] = useState<Partial<Invoice> | null>(null);
  const [drafts, setDrafts] = useState<DunningDraft[]>([]);
  
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', clientName: 'Studio Graphique', amount: 1200, dueDate: '2024-02-15', status: InvoiceStatus.OVERDUE, riskLevel: 'Moyen', lastAction: 'Relance 2 (J+10)' },
    { id: '2', clientName: 'Boulangerie du Coin', amount: 350, dueDate: '2024-03-01', status: InvoiceStatus.PENDING, riskLevel: 'Faible', lastAction: 'Facture envoyée' },
  ]);

  const handleAnalyze = async () => {
    if (!inputText) return;
    setIsAnalyzing(true);
    try {
      // 1. Extract Data
      const invoiceData = await analyzeInvoiceText(inputText);
      setAnalyzedInvoice(invoiceData);

      // 2. Generate Drafts with correct language
      const generatedDrafts = await generateDunningSequence(
        invoiceData.clientName || 'Client', 
        invoiceData.amount || 0,
        language
      );
      setDrafts(generatedDrafts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (analyzedInvoice) {
      const newInvoice: Invoice = {
        id: analyzedInvoice.id || Date.now().toString(),
        clientName: analyzedInvoice.clientName || 'Unknown',
        amount: analyzedInvoice.amount || 0,
        dueDate: analyzedInvoice.dueDate || new Date().toISOString(),
        status: InvoiceStatus.RECOVERY_STARTED,
        riskLevel: analyzedInvoice.riskLevel || 'Faible',
        lastAction: 'Automation Started'
      };
      setInvoices([newInvoice, ...invoices]);
      setView('list');
      setAnalyzedInvoice(null);
      setInputText('');
      setDrafts([]);
    }
  };

  return (
    <div className="space-y-8 fade-in max-w-7xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('rec.title')}</h2>
          <p className="text-slate-500 mt-1">{t('rec.subtitle')}</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('new')}
            className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 font-medium"
          >
            <Upload size={18} />
            <span>{t('rec.new')}</span>
          </button>
        )}
      </header>

      {view === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Client</th>
                <th className="px-8 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Montant</th>
                <th className="px-8 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Échéance</th>
                <th className="px-8 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Statut</th>
                <th className="px-8 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Risque</th>
                <th className="px-8 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-8 py-5 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {inv.clientName.charAt(0)}
                      </div>
                      {inv.clientName}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900">{inv.amount.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €</td>
                  <td className="px-8 py-5 text-slate-500">{inv.dueDate}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      inv.status === InvoiceStatus.OVERDUE ? 'bg-red-50 text-red-700 border-red-100' :
                      inv.status === InvoiceStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                       <div className={`w-2.5 h-2.5 rounded-full ${
                         inv.riskLevel === 'Élevé' ? 'bg-red-500' : 
                         inv.riskLevel === 'Moyen' ? 'bg-amber-500' : 'bg-emerald-500'
                       }`} />
                       <span className="text-sm text-slate-600">{inv.riskLevel}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-400 hover:text-primary transition">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-blue-200">1</span>
                  {t('rec.step1')}
                </h3>
                
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50/50 hover:bg-white hover:border-primary transition-colors text-center cursor-text group" onClick={() => document.getElementById('inv-input')?.focus()}>
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                     <FileText className="text-primary" size={24} />
                   </div>
                   <p className="text-sm font-medium text-slate-900 mb-1">Collez le texte de la facture</p>
                   <p className="text-xs text-slate-500 mb-4">{t('rec.step1_desc')}</p>
                   
                   <textarea
                    id="inv-input"
                    className="w-full h-32 p-4 bg-transparent border-none focus:ring-0 text-sm font-mono resize-none text-slate-600"
                    placeholder="Facture N° 2024-001..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  ></textarea>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText}
                    className="bg-secondary text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center font-medium shadow-lg shadow-slate-200"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        {t('rec.analyzing')}
                      </>
                    ) : (
                      <>
                        {t('rec.analyze_btn')}
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {analyzedInvoice && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-scale-in">
                 <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-emerald-200">2</span>
                  {t('rec.step2')}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Client</span>
                    <span className="font-bold text-slate-900">{analyzedInvoice.clientName}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Montant</span>
                    <span className="font-bold text-emerald-600 text-lg">{analyzedInvoice.amount} €</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Échéance</span>
                    <span className="font-bold text-slate-900">{analyzedInvoice.dueDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {drafts.length > 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col animate-slide-up">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                   <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-amber-200">3</span>
                  {t('rec.step3')}
                </h3>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                  {drafts.map((draft, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group bg-white">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                           <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                           <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wide">
                            {draft.tone}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          J+{draft.level === 1 ? '3' : draft.level === 2 ? '10' : '20'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-2">{draft.subject}</h4>
                      <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap font-medium">
                        {draft.body}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button 
                    onClick={() => {
                      setDrafts([]);
                      setAnalyzedInvoice(null);
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition"
                  >
                    {t('rec.cancel')}
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-xl hover:bg-emerald-600 transition flex items-center font-bold shadow-lg shadow-emerald-200"
                  >
                    <Check className="mr-2" size={18} />
                    {t('rec.activate')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Send className="text-slate-300" size={32} />
                </div>
                <p className="font-medium text-slate-500">En attente d'analyse...</p>
                <p className="text-sm text-slate-400 mt-2">Le plan d'action apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};