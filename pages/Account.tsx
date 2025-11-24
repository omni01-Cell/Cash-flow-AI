import React, { useState } from 'react';
import { User, CreditCard, Edit2, Save, History, Plus, Mail, Send, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const AccountPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Jean Solopreneur',
    email: 'jean@example.com'
  });
  const [tempProfile, setTempProfile] = useState(profile);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  // Mock Activity History Data
  const history = [
    { id: 1, type: 'email_sent', date: '2024-03-10', desc: 'Relance J+10 envoyée à Studio Graphique', amount: null, status: 'success' },
    { id: 2, type: 'payment', date: '2024-03-01', desc: 'Abonnement Pro Mensuel', amount: '-29.00 €', status: 'success' },
    { id: 3, type: 'mail_sent', date: '2024-02-28', desc: 'Lettre Recommandée (AR) - Agence Design', amount: '-15.00 €', status: 'success' },
    { id: 4, type: 'payment', date: '2024-02-01', desc: 'Abonnement Pro Mensuel', amount: '-29.00 €', status: 'success' },
  ];

  // Mock Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'pm_1', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
  ]);

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('acc.title')}</h2>
      </header>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 shrink-0">
            <User size={40} />
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
                onClick={() => setSelectedPlan('starter')}
                className={`flex-1 p-4 rounded-lg border-2 text-left transition ${
                  selectedPlan === 'starter' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">Starter</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">0€</div>
                <div className="text-xs text-slate-500 mt-1">Manual only</div>
              </button>
              <button 
                onClick={() => setSelectedPlan('pro')}
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
            <button className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-full transition">
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
                    {pm.isDefault && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">Défaut</span>
                    )}
                    <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-800 flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Vos informations de paiement sont sécurisées et chiffrées. Nous n'avons jamais accès à votre numéro complet.
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
    </div>
  );
};