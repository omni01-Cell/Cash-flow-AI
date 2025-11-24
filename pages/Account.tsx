import React, { useState } from 'react';
import { User, CreditCard, Edit2, Save, History, Plus, Mail, Send, FileText, CheckCircle, AlertTriangle, Camera, Trash2, Star, X } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const AccountPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Jean Solopreneur',
    email: 'jean@example.com'
  });
  const [tempProfile, setTempProfile] = useState(profile);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Mock Activity History Data
  const history = [
    { id: 1, type: 'email_sent', date: '2024-03-10', desc: 'Relance J+10 envoyée à Studio Graphique', amount: null, status: 'success' },
    { id: 2, type: 'payment', date: '2024-03-01', desc: 'Abonnement Pro Mensuel', amount: '-29.00 €', status: 'success' },
    { id: 3, type: 'mail_sent', date: '2024-02-28', desc: 'Lettre Recommandée (AR) - Agence Design', amount: '-15.00 €', status: 'success' },
    { id: 4, type: 'payment', date: '2024-02-01', desc: 'Abonnement Pro Mensuel', amount: '-29.00 €', status: 'success' },
  ];

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm_1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 'pm_2', type: 'card', brand: 'Mastercard', last4: '8888', expiry: '10/26', isDefault: false },
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ brand: 'Visa', number: '', expiry: '', cvc: '' });

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const initiatePlanChange = (planId: string) => {
    if (planId === selectedPlan) return;
    setPendingPlan(planId);
    setShowPlanModal(true);
  };

  const confirmPlanChange = () => {
    if (pendingPlan) {
      setSelectedPlan(pendingPlan);
      setShowPlanModal(false);
      setPendingPlan(null);
    }
  };

  // Payment Handlers
  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handleDeletePayment = (id: string) => {
    const methodToDelete = paymentMethods.find(pm => pm.id === id);
    if (methodToDelete?.isDefault) {
      alert("Impossible de supprimer le moyen de paiement par défaut. Veuillez en définir un autre par défaut avant de supprimer celui-ci.");
      return;
    }
    if (confirm("Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?")) {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    }
  };

  const openAddPaymentModal = () => {
    setEditingPaymentId(null);
    setPaymentForm({ brand: 'Visa', number: '', expiry: '', cvc: '' });
    setShowPaymentModal(true);
  };

  const openEditPaymentModal = (pm: typeof paymentMethods[0]) => {
    setEditingPaymentId(pm.id);
    setPaymentForm({ brand: pm.brand, number: `•••• •••• •••• ${pm.last4}`, expiry: pm.expiry, cvc: '***' });
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPaymentId) {
      // Edit existing
      setPaymentMethods(paymentMethods.map(pm => 
        pm.id === editingPaymentId 
          ? { ...pm, expiry: paymentForm.expiry } // Only update expiry for demo
          : pm
      ));
    } else {
      // Add new
      const last4 = paymentForm.number.slice(-4) || '1234';
      const newMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        brand: paymentForm.brand,
        last4: last4,
        expiry: paymentForm.expiry,
        isDefault: paymentMethods.length === 0 // Make default if it's the first one
      };
      setPaymentMethods([...paymentMethods, newMethod]);
    }
    setShowPaymentModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in pb-12 relative">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('acc.title')}</h2>
      </header>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 shrink-0 overflow-hidden border-2 border-white shadow-sm">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={20} />
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
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-2">
                  Active
                </span>
              </div>
              {!isEditing ? (
                <button 
                  onClick={handleEdit}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  ) : (
                    <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  ) : (
                    <p className="text-slate-500">{profile.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subscription Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} /> {t('acc.plan')}
            </h3>
            <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded">Mensuel</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={() => initiatePlanChange('starter')}
                className={`flex-1 p-4 rounded-lg border-2 text-left transition ${
                  selectedPlan === 'starter' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">Starter</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">0€</div>
                <div className="text-xs text-slate-500 mt-1">Manual only</div>
              </button>
              <button 
                onClick={() => initiatePlanChange('pro')}
                className={`flex-1 p-4 rounded-lg border-2 text-left transition ${
                  selectedPlan === 'pro' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm font-semibold text-slate-900">Pro</div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                </div>
                <div className="text-2xl font-bold text-indigo-600 mt-1">29€</div>
                <div className="text-xs text-slate-500 mt-1">Full Auto + AI</div>
              </button>
            </div>
            
            <div>
               <h4 className="text-sm font-medium text-slate-700 mb-3">Historique Facturation</h4>
               <div className="space-y-2">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded text-sm">
                     <div className="flex items-center gap-2">
                       <FileText size={14} className="text-slate-400" />
                       <span>01 Mar 2024</span>
                     </div>
                     <span className="font-medium">29.00 €</span>
                     <button className="text-indigo-600 hover:underline text-xs">PDF</button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} /> Moyens de Paiement
            </h3>
            <button 
              onClick={openAddPaymentModal}
              className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-slate-800 rounded text-white text-[10px] flex items-center justify-center font-bold tracking-wider">
                      {pm.brand.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">•••• •••• •••• {pm.last4}</p>
                      <p className="text-xs text-slate-500">Expire {pm.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pm.isDefault ? (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">Défaut</span>
                    ) : (
                      <button 
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-full transition"
                        title="Définir par défaut"
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => openEditPaymentModal(pm)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    {!pm.isDefault && (
                      <button 
                        onClick={() => handleDeletePayment(pm.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-800 flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Vos informations de paiement sont sécurisées et chiffrées.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <History size={18} /> Historique d'Activité
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Montant</th>
                <th className="px-6 py-3 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${item.type === 'email_sent' ? 'bg-blue-100 text-blue-700' : 
                        item.type === 'mail_sent' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.type === 'email_sent' && <Mail size={12} />}
                      {item.type === 'mail_sent' && <Send size={12} />}
                      {item.type === 'payment' && <CreditCard size={12} />}
                      {item.type === 'email_sent' ? 'Email' : item.type === 'mail_sent' ? 'Courrier' : 'Paiement'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{item.desc}</td>
                  <td className={`px-6 py-4 text-right font-medium ${item.amount ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.amount || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === 'success' && <CheckCircle size={16} className="text-emerald-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Voir tout l'historique
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Plan Change */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all scale-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmer le changement ?</h3>
            <p className="text-slate-600 mb-6">
              Vous êtes sur le point de passer au plan <span className="font-bold text-indigo-600 uppercase">{pendingPlan}</span>. 
              {pendingPlan === 'pro' ? (
                <span> Vous serez facturé <span className="font-bold text-slate-900">29€/mois</span> immédiatement.</span>
              ) : (
                <span> Vous perdrez l'accès aux fonctionnalités d'automatisation IA et au support prioritaire.</span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowPlanModal(false);
                  setPendingPlan(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={confirmPlanChange}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md shadow-indigo-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingPaymentId ? 'Modifier la carte' : 'Ajouter une carte'}
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de carte</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={paymentForm.number}
                    onChange={(e) => setPaymentForm({...paymentForm, number: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    disabled={!!editingPaymentId} // Disable editing number for existing card
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiration (MM/YY)</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={paymentForm.expiry}
                    onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    value={paymentForm.cvc}
                    onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {!editingPaymentId && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                   <select 
                     value={paymentForm.brand}
                     onChange={(e) => setPaymentForm({...paymentForm, brand: e.target.value})}
                     className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                   >
                     <option value="Visa">Visa</option>
                     <option value="Mastercard">Mastercard</option>
                     <option value="Amex">American Express</option>
                   </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
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
