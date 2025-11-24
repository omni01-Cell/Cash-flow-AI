import React, { useState } from 'react';
import { Upload, FileText, Send, Loader2, Check } from 'lucide-react';
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
    <div className="space-y-6 fade-in">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('rec.title')}</h2>
          <p className="text-slate-500">{t('rec.subtitle')}</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('new')}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Upload size={18} />
            <span>{t('rec.new')}</span>
          </button>
        )}
      </header>

      {view === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Client</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Montant</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Échéance</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Statut</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{inv.clientName}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{inv.amount.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €</td>
                  <td className="px-6 py-4 text-slate-500">{inv.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      inv.status === InvoiceStatus.OVERDUE ? 'bg-red-100 text-red-700' :
                      inv.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                       <div className={`w-2 h-2 rounded-full ${
                         inv.riskLevel === 'Élevé' ? 'bg-red-500' : 
                         inv.riskLevel === 'Moyen' ? 'bg-amber-500' : 'bg-green-500'
                       }`} />
                       <span className="text-xs text-slate-600">{inv.riskLevel}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  1
                </div>
                {t('rec.step1')}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {t('rec.step1_desc')}
              </p>
              <textarea
                className="w-full h-48 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="Ex: Facture N° 2024-001..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {t('rec.analyzing')}
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2" size={18} />
                      {t('rec.analyze_btn')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {analyzedInvoice && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                    2
                  </div>
                  {t('rec.step2')}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded">
                    <span className="block text-slate-500 text-xs uppercase">Client</span>
                    <span className="font-semibold text-slate-900">{analyzedInvoice.clientName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <span className="block text-slate-500 text-xs uppercase">Montant</span>
                    <span className="font-semibold text-slate-900">{analyzedInvoice.amount} €</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <span className="block text-slate-500 text-xs uppercase">Échéance</span>
                    <span className="font-semibold text-slate-900">{analyzedInvoice.dueDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {drafts.length > 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                    3
                  </div>
                  {t('rec.step3')}
                </h3>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {drafts.map((draft, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-slate-100 text-slate-600">
                          {draft.tone}
                        </span>
                        <span className="text-xs text-slate-400">
                          Level {draft.level}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">{draft.subject}</h4>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded italic whitespace-pre-wrap">
                        {draft.body}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => {
                      setDrafts([]);
                      setAnalyzedInvoice(null);
                    }}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    {t('rec.cancel')}
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center"
                  >
                    <Check className="mr-2" size={18} />
                    {t('rec.activate')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Send className="text-slate-300" size={32} />
                </div>
                <p>En attente...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};