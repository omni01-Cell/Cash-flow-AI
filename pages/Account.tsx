import React, { useState } from 'react';
import { User, CreditCard, Edit2, Save } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const AccountPage: React.FC = () => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Jean Solopreneur',
    email: 'jean@example.com'
  });
  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">{t('acc.title')}</h2>
      </header>

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
                  <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={18} /> {t('acc.plan')}
          </h3>
        </div>
        <div className="p-6">
           <div className="flex justify-between items-center mb-4">
             <span className="text-lg font-medium text-slate-700">Pro Plan</span>
             <span className="text-2xl font-bold text-indigo-600">29€<span className="text-sm text-slate-400 font-normal">/mo</span></span>
           </div>
           <p className="text-sm text-slate-500 mb-6">Renouvellement le 24 Mai 2025</p>
           <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
             <div className="bg-indigo-600 h-2 rounded-full" style={{width: '65%'}}></div>
           </div>
           <p className="text-xs text-right text-slate-400">65% {t('acc.usage')}</p>
        </div>
      </div>
    </div>
  );
};