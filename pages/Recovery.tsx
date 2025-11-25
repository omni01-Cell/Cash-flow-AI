import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Send, Loader2, Check, ArrowRight, Download, AlertTriangle, Sparkles, ChevronUp, Mail, Gavel, Phone, Trash2, File, X } from 'lucide-react';
import { analyzeInvoiceText, analyzeInvoiceFile, generateDunningSequence } from '../services/geminiService';
import { Invoice, DunningDraft, InvoiceStatus } from '../types';
import { useLanguage } from '../utils/i18n';
import { supabase } from '../services/supabaseClient';

interface ExtendedInvoice extends Invoice {
  aiAnalysis?: string;
  recommendedAction?: string;
  actionType?: 'email' | 'legal' | 'call';
}

export const Recovery: React.FC<{ userId: string }> = ({ userId }) => {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [inputType, setInputType] = useState<'file' | 'text'>('file');
  
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedInvoice, setAnalyzedInvoice] = useState<Partial<Invoice> | null>(null);
  const [drafts, setDrafts] = useState<DunningDraft[]>([]);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
      } else {
        const mappedInvoices: ExtendedInvoice[] = data.map((inv: any) => ({
          id: inv.id,
          clientName: inv.client_name,
          amount: inv.amount,
          dueDate: inv.due_date,
          status: inv.status as InvoiceStatus,
          riskLevel: inv.risk_level,
          aiAnalysis: inv.ai_analysis,
          recommendedAction: inv.recommended_action,
          // File fields
          fileUrl: inv.file_url,
          fileName: inv.file_name,
          filePath: inv.file_path,
          fileType: inv.file_type
        }));
        setInvoices(mappedInvoices);
      }
      setLoadingInvoices(false);
    };

    if (userId) fetchInvoices();
  }, [userId]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data:image/jpeg;base64, part
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!inputText && !selectedFile) return;
    setIsAnalyzing(true);
    
    try {
      let invoiceData: Partial<Invoice>;

      if (inputType === 'file' && selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        invoiceData = await analyzeInvoiceFile(base64, selectedFile.type);
      } else {
        invoiceData = await analyzeInvoiceText(inputText);
      }

      setAnalyzedInvoice(invoiceData);

      const generatedDrafts = await generateDunningSequence(
        invoiceData.clientName || 'Client', 
        invoiceData.amount || 0,
        language
      );
      setDrafts(generatedDrafts);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'analyse. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (analyzedInvoice && userId) {
      try {
        const aiInsight = "Analysé par Gemini. Risque " + analyzedInvoice.riskLevel;
        const recAction = "Démarrer séquence de relance";
        let uploadedFileUrl = null;
        let uploadedFilePath = null;

        // Upload File to Supabase Storage
        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(filePath, selectedFile);

          if (uploadError) throw uploadError;

          // Get Public URL
          const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(filePath);
          
          uploadedFileUrl = publicUrl;
          uploadedFilePath = filePath;
        }

        // Insert DB Record
        const { data, error } = await supabase
          .from('invoices')
          .insert([{
            user_id: userId,
            client_name: analyzedInvoice.clientName || 'Unknown',
            amount: analyzedInvoice.amount || 0,
            due_date: analyzedInvoice.dueDate || new Date().toISOString(),
            status: InvoiceStatus.RECOVERY_STARTED,
            risk_level: analyzedInvoice.riskLevel || 'Faible',
            ai_analysis: aiInsight,
            recommended_action: recAction,
            // File Meta
            file_url: uploadedFileUrl,
            file_path: uploadedFilePath,
            file_name: selectedFile?.name || null,
            file_type: selectedFile?.type || null
          }])
          .select()
          .single();

        if (error) throw error;

        // Add Activity Log
        await supabase.from('activity_logs').insert([{
          user_id: userId,
          type: 'invoice_created',
          description: `Nouvelle procédure : ${analyzedInvoice.clientName}`,
          amount: analyzedInvoice.amount || 0,
          status: 'success'
        }]);

        // Update local state
        const newInvoice: ExtendedInvoice = {
          id: data.id,
          clientName: data.client_name,
          amount: data.amount,
          dueDate: data.due_date,
          status: data.status as InvoiceStatus,
          riskLevel: data.risk_level,
          aiAnalysis: data.ai_analysis,
          recommendedAction: data.recommended_action,
          fileUrl: data.file_url,
          fileName: data.file_name,
          filePath: data.file_path,
          fileType: data.file_type
        };

        setInvoices([newInvoice, ...invoices]);
        
        // Reset
        setView('list');
        setAnalyzedInvoice(null);
        setInputText('');
        setSelectedFile(null);
        setDrafts([]);
      } catch (err) {
        console.error("Error saving invoice:", err);
        alert("Erreur lors de la sauvegarde.");
      }
    }
  };

  const handleDelete = async (id: string, filePath?: string | null) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture et les fichiers associés ?")) return;

    try {
      // 1. Delete file from storage if exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('invoices')
          .remove([filePath]);
        if (storageError) console.error("Storage delete error", storageError);
      }

      // 2. Delete record from DB
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Impossible de supprimer la facture.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
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
          {loadingInvoices ? (
            <div className="p-12 text-center text-slate-400">Chargement...</div>
          ) : invoices.length === 0 ? (
             <div className="p-12 text-center text-slate-400">
               <FileText size={48} className="mx-auto mb-4 text-slate-200" />
               <p>Aucune facture en cours.</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Fichier</th>
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Client</th>
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Risque</th>
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <React.Fragment key={inv.id}>
                    <tr 
                      onClick={() => toggleExpand(inv.id)}
                      className={`hover:bg-slate-50/50 transition cursor-pointer group ${expandedInvoiceId === inv.id ? 'bg-slate-50' : ''}`}
                    >
                      <td className="px-6 py-5">
                        {inv.fileUrl ? (
                          <a 
                            href={inv.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title={inv.fileName || "Voir le fichier"}
                          >
                            <FileText size={18} />
                          </a>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-slate-300">
                            <FileText size={18} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-900">
                        {inv.clientName}
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-900">{Number(inv.amount).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          inv.status === InvoiceStatus.OVERDUE ? 'bg-red-50 text-red-700 border-red-100' :
                          inv.status === InvoiceStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            inv.riskLevel === 'Élevé' ? 'bg-red-500' : 
                            inv.riskLevel === 'Moyen' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="text-sm text-slate-600">{inv.riskLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right flex justify-end items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(inv.id, inv.filePath); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          className={`p-2 rounded-full transition ${expandedInvoiceId === inv.id ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}
                        >
                          {expandedInvoiceId === inv.id ? <ChevronUp size={20} /> : <ArrowRight size={20} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Analysis Panel */}
                    {expandedInvoiceId === inv.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-8 pb-8 pt-2">
                          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-slide-up flex flex-col md:flex-row gap-6">
                            {/* Left: AI Insight */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                                  <Sparkles size={16} />
                                  Analyse IA & Contexte
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                  {inv.aiAnalysis || "Analyse en attente..."}
                                </p>
                                
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                  <h4 className="text-amber-800 font-bold text-xs uppercase mb-1">Action Recommandée</h4>
                                  <p className="text-amber-900 text-sm font-medium">{inv.recommendedAction || "Aucune action spécifique."}</p>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="w-full md:w-64 space-y-3 shrink-0">
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100 font-medium text-sm group">
                                  <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>Générer Email</span>
                                  </div>
                                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                
                                <button className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-sm">
                                  <div className="flex items-center gap-2">
                                    <Gavel size={16} />
                                    <span>Mise en Demeure</span>
                                  </div>
                                </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
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

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    onClick={() => { setInputType('file'); setSelectedFile(null); setInputText(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${inputType === 'file' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Importer Fichier
                  </button>
                  <button
                    onClick={() => { setInputType('text'); setSelectedFile(null); setInputText(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${inputType === 'text' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Coller Texte
                  </button>
                </div>
                
                {inputType === 'file' ? (
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors group ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.png,.jpg,.jpeg,.txt"
                      onChange={handleFileChange}
                    />
                    
                    {selectedFile ? (
                      <div className="py-4">
                        <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <File size={32} />
                        </div>
                        <p className="font-bold text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          className="mt-4 text-xs text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Supprimer
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          <Upload className="text-primary" size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1">Cliquez ou glissez un fichier</p>
                        <p className="text-xs text-slate-500">PDF, PNG, JPG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 focus-within:bg-white focus-within:border-primary transition-colors">
                     <textarea
                      className="w-full h-32 p-2 bg-transparent border-none focus:ring-0 text-sm font-mono resize-none text-slate-600"
                      placeholder="Copiez le contenu de la facture ici..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    ></textarea>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!inputText && !selectedFile)}
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
                 {/* Header Step 2 */}
                 <div className="flex justify-between items-start mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-emerald-200">2</span>
                      {t('rec.step2')}
                    </h3>
                    
                    {(!analyzedInvoice.clientName || !analyzedInvoice.amount || !analyzedInvoice.dueDate) ? (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                            <AlertTriangle size={12} /> Données manquantes
                        </span>
                    ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                            <Check size={12} /> Extraction réussie
                        </span>
                    )}
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Client */}
                  <div className={`p-4 rounded-xl border transition-colors ${analyzedInvoice.clientName ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`block text-[10px] uppercase font-bold tracking-wider ${analyzedInvoice.clientName ? 'text-slate-400' : 'text-red-400'}`}>Client</span>
                        {!analyzedInvoice.clientName && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                    {analyzedInvoice.clientName ? (
                        <span className="font-bold text-slate-900">{analyzedInvoice.clientName}</span>
                    ) : (
                        <span className="text-red-500 font-medium italic">Nom non détecté</span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className={`p-4 rounded-xl border transition-colors ${analyzedInvoice.amount ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`block text-[10px] uppercase font-bold tracking-wider ${analyzedInvoice.amount ? 'text-slate-400' : 'text-red-400'}`}>Montant</span>
                        {!analyzedInvoice.amount && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                    {analyzedInvoice.amount ? (
                        <span className="font-bold text-emerald-600 text-lg">{analyzedInvoice.amount} €</span>
                    ) : (
                         <span className="text-red-500 font-medium italic">Non détecté</span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className={`p-4 rounded-xl border transition-colors ${analyzedInvoice.dueDate ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`block text-[10px] uppercase font-bold tracking-wider ${analyzedInvoice.dueDate ? 'text-slate-400' : 'text-red-400'}`}>Échéance</span>
                        {!analyzedInvoice.dueDate && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                    {analyzedInvoice.dueDate ? (
                        <span className="font-bold text-slate-900">{analyzedInvoice.dueDate}</span>
                    ) : (
                         <span className="text-red-500 font-medium italic">Non détectée</span>
                    )}
                  </div>
                </div>

                 {/* AI Insight / Risk Level */}
                 {analyzedInvoice.riskLevel && (
                     <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-0.5">Analyse IA</p>
                            <p className="text-sm text-indigo-700 leading-relaxed">
                                Facture analysée avec succès. Risque identifié : <span className="font-bold px-1.5 py-0.5 bg-white rounded text-indigo-900 shadow-sm">{analyzedInvoice.riskLevel}</span>. 
                                Les courriers générés ci-dessous ont été adaptés en conséquence.
                            </p>
                        </div>
                     </div>
                 )}
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