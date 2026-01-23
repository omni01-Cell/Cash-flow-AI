import React, { useState, useEffect } from 'react';
import { User, CreditCard, Edit2, Save, History, Plus, Mail, Send, FileText, CheckCircle, AlertTriangle, Camera, Trash2, Star, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { UserProfile, PaymentMethod, BillingRecord, ActivityLog } from '../types';
import { supabase } from '../services/supabaseClient';

interface AccountPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ userProfile, onUpdateProfile }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    name: userProfile.name,
    email: userProfile.email
  });
  const [tempAvatar, setTempAvatar] = useState<string | null>(userProfile.avatar);
  
  const [selectedPlan, setSelectedPlan] = useState(userProfile.plan === 'Starter' ? 'starter' : 'pro');
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Real Data States
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ brand: 'Visa', number: '', expiry: '', cvc: '' });

  useEffect(() => {
    fetchAccountData();
  }, [userProfile]);

  const fetchAccountData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Parallel Data Fetching
    const [
      { data: pmData },
      { data: billData },
      { data: logData }
    ] = await Promise.all([
      supabase
        .from('payment_methods')
        .select('*')
        .order('is_default', { ascending: false }),
      supabase
        .from('billing_history')
        .select('*')
        .order('date', { ascending: false })
        .limit(5),
      supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    if (pmData) setPaymentMethods(pmData as PaymentMethod[]);
    if (billData) setBillingHistory(billData as unknown as BillingRecord[]);
    
    // Manual mapping for compatibility if column names differ slightly or just casting
    if (logData) {
      const mappedLogs: ActivityLog[] = logData.map((l: any) => ({
        id: l.id,
        type: l.type,
        created_at: l.created_at, // Postgres timestamp string
        description: l.description,
        amount: l.amount,
        status: l.status
      }));
      setActivityLogs(mappedLogs);
    }
    
    setLoading(false);
  };

  const handleEdit = () => {
    setTempProfile({ name: userProfile.name, email: userProfile.email });
    setTempAvatar(userProfile.avatar);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateProfile({
      ...userProfile,
      name: tempProfile.name,
      email: tempProfile.email,
      avatar: tempAvatar
    });
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Optimistic update
      const imageUrl = URL.createObjectURL(file);
      setTempAvatar(imageUrl);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Upload to 'avatars' bucket
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        // Update tempAvatar with the real URL
        setTempAvatar(publicUrl);

      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert("Erreur lors du téléchargement de l'image.");
        // Revert to original if needed or just keep local blob
      }
    }
  };

  const initiatePlanChange = (planId: string) => {
    if (planId === selectedPlan) return;
    setPendingPlan(planId);
    setShowPlanModal(true);
  };

  const confirmPlanChange = async () => {
    if (pendingPlan) {
      const newPlanName = pendingPlan === 'pro' ? 'Pro Plan' : 'Starter Plan';
      
      // Update local state
      setSelectedPlan(pendingPlan);
      onUpdateProfile({
        ...userProfile,
        plan: newPlanName
      });
      
      // Log this activity to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert([{
          user_id: user.id,
          type: 'system',
          description: `Changement de plan vers ${newPlanName}`,
          status: 'success'
        }]);
        fetchAccountData(); // Refresh logs
      }

      setShowPlanModal(false);
      setPendingPlan(null);
    }
  };

  // Payment Handlers
  const handleSetDefaultPayment = async (id: string) => {
    // Optimistic update
    const previousState = [...paymentMethods];
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      is_default: pm.id === id
    })));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // Set all to false
      await supabase.from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Set selected to true
      await supabase.from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      // Refresh to be sure
      fetchAccountData();
    } catch (e) {
      console.error(e);
      setPaymentMethods(previousState); // Revert on error
    }
  };

  const handleDeletePayment = async (id: string) => {
    const methodToDelete = paymentMethods.find(pm => pm.id === id);
    if (methodToDelete?.is_default) {
      alert("Impossible de supprimer le moyen de paiement par défaut.");
      return;
    }
    if (confirm("Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?")) {
       setPaymentMethods(paymentMethods.filter(pm => pm.id !== id)); // Optimistic
       await supabase.from('payment_methods').delete().eq('id', id);
    }
  };

  const openAddPaymentModal = () => {
    setEditingPaymentId(null);
    setPaymentForm({ brand: 'Visa', number: '', expiry: '', cvc: '' });
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (pm: PaymentMethod) => {
    setEditingPaymentId(pm.id);
    setPaymentForm({ brand: pm.brand, number: `•••• ${pm.last4}`, expiry: pm.expiry, cvc: '***' });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingPaymentId) {
      // Edit existing
      await supabase.from('payment_methods')
        .update({ expiry: paymentForm.expiry })
        .eq('id', editingPaymentId);
    } else {
      // Add new
      const last4 = paymentForm.number.slice(-4) || '1234';
      const isFirst = paymentMethods.length === 0;
      
      await supabase.from('payment_methods').insert([{
        user_id: user.id,
        brand: paymentForm.brand,
        last4: last4,
        expiry: paymentForm.expiry,
        is_default: isFirst
      }]);
    }
    setShowPaymentModal(false);
    fetchAccountData();
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n ? n[0] : '')
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper for last invoice
  const lastBill = billingHistory.length > 0 ? billingHistory[0] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in pb-12 relative">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('acc.title')}</h2>
      </header>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 overflow-hidden border-4 border-white shadow-lg relative">
              {isEditing ? (
                 tempAvatar ? (
                   <img src={tempAvatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                     {getInitials(tempProfile.name)}
                   </div>
                 )
              ) : (
                 userProfile.avatar ? (
                   <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                     {getInitials(userProfile.name)}
                   </div>
                 )
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10 backdrop-blur-sm">
                <Camera size={24} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2 border border-emerald-100">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Compte Actif
                </span>
              </div>
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  className="text-primary hover:text-blue-700 flex items-center gap-2 text-sm font-bold bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition"
                >
                  <Edit2 size={16} /> Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                       setIsEditing(false);
                       setTempAvatar(userProfile.avatar); 
                    }}
                    className="text-slate-500 hover:text-slate-700 text-sm font-bold px-4 py-2"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-bold transition shadow-lg shadow-blue-200"
                  >
                    <Save size={16} /> Enregistrer
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nom Complet</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    />
                  ) : (
                    <h3 className="text-xl font-bold text-slate-900">{userProfile.name}</h3>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Adresse Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
                    />
                  ) : (
                    <p className="text-lg text-slate-600">{userProfile.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subscription Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                 <CreditCard size={18} />
              </div>
              {t('acc.plan')}
            </h3>
            <span className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full">Mensuel</span>
          </div>
          <div className="p-8 space-y-6 flex-1">
            <div className="flex gap-4">
              <button 
                onClick={() => initiatePlanChange('starter')}
                className={`flex-1 p-5 rounded-2xl border-2 text-left transition relative ${
                  selectedPlan === 'starter' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Starter</div>
                <div className="text-3xl font-bold text-slate-900">0€</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Manuel uniquement</div>
              </button>
              <button 
                onClick={() => initiatePlanChange('pro')}
                className={`flex-1 p-5 rounded-2xl border-2 text-left transition relative overflow-hidden ${
                  selectedPlan === 'pro' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                 {selectedPlan === 'pro' && <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-bl-xl">ACTIF</div>}
                <div className="text-sm font-bold text-primary uppercase tracking-wide mb-2">Pro</div>
                <div className="text-3xl font-bold text-slate-900">29€</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">100% Automatisé</div>
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Dernière Facture</h4>
               {lastBill ? (
                 <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-white rounded border border-slate-200 text-slate-400">
                       <FileText size={16} />
                     </div>
                     <div className="font-medium text-slate-900">
                       {new Date(lastBill.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="font-bold">{lastBill.amount.toLocaleString()} €</span>
                      <button className="text-primary hover:underline text-xs font-bold">PDF</button>
                   </div>
                 </div>
               ) : (
                 <p className="text-sm text-slate-400 italic">Aucune facture disponible.</p>
               )}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <CreditCard size={18} />
              </div>
              Paiement
            </h3>
            <button 
              onClick={openAddPaymentModal}
              className="text-primary hover:bg-blue-50 p-2 rounded-lg transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="p-8 flex-1">
            <div className="space-y-4">
              {paymentMethods.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">Aucun moyen de paiement.</div>
              )}
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-primary/30 transition group bg-white shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-800 rounded-md text-white text-[10px] flex items-center justify-center font-bold tracking-widest shadow-md">
                      {pm.brand.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">•••• {pm.last4}</p>
                      <p className="text-xs text-slate-500 font-medium">Expire {pm.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pm.is_default ? (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded tracking-wide mr-2">Défaut</span>
                    ) : (
                      <button 
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
                        title="Définir par défaut"
                      >
                        <Star size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => openEditPaymentModal(pm)}
                      className="p-2 text-slate-300 hover:text-primary hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    {!pm.is_default && (
                      <button 
                        onClick={() => handleDeletePayment(pm.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
              <AlertTriangle size={20} className="shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Vos informations de paiement sont sécurisées via Stripe. Nous ne stockons jamais vos numéros de carte complets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
               <History size={18} />
            </div>
            Historique d'Activité
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" /></div>
          ) : activityLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic">Aucune activité récente.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Action</th>
                  <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                  <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs text-right">Montant</th>
                  <th className="px-8 py-4 font-semibold uppercase tracking-wider text-xs text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-8 py-5 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                        ${item.type === 'email_sent' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                          item.type === 'payment' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.type === 'email_sent' && <Mail size={12} />}
                        {item.type === 'mail_sent' && <Send size={12} />}
                        {item.type === 'payment' && <CreditCard size={12} />}
                        {item.type === 'invoice_created' && <FileText size={12} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-900 font-medium">{item.description}</td>
                    <td className={`px-8 py-5 text-right font-bold ${item.amount ? 'text-slate-900' : 'text-slate-400'}`}>
                      {item.amount ? item.amount + ' €' : '-'}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Plan Change */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 backdrop-blur-sm fade-in p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Confirmer le changement</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Vous allez passer au plan <span className="font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">{pendingPlan}</span>. 
              {pendingPlan === 'pro' ? (
                <span> Vous serez facturé <span className="font-bold text-slate-900">29€/mois</span> immédiatement.</span>
              ) : (
                <span> Vous perdrez l'accès aux fonctionnalités d'automatisation IA.</span>
              )}
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => {
                  setShowPlanModal(false);
                  setPendingPlan(null);
                }}
                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-bold"
              >
                Annuler
              </button>
              <button 
                onClick={confirmPlanChange}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 backdrop-blur-sm fade-in p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingPaymentId ? 'Modifier la carte' : 'Ajouter une carte'}
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSavePayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Numéro de carte</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={paymentForm.number}
                    onChange={(e) => setPaymentForm({...paymentForm, number: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition font-medium"
                    disabled={!!editingPaymentId}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Expiration</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={paymentForm.expiry}
                    onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    value={paymentForm.cvc}
                    onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition font-medium"
                    required
                  />
                </div>
              </div>

              {!editingPaymentId && (
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Marque</label>
                   <select 
                     value={paymentForm.brand}
                     onChange={(e) => setPaymentForm({...paymentForm, brand: e.target.value})}
                     className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white font-medium"
                   >
                     <option value="Visa">Visa</option>
                     <option value="Mastercard">Mastercard</option>
                     <option value="Amex">American Express</option>
                   </select>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};