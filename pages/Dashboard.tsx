import React from 'react';
import { Euro, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../utils/i18n';

const data = [
  { name: 'Jan', recouvre: 4000, attente: 2400 },
  { name: 'Fév', recouvre: 3000, attente: 1398 },
  { name: 'Mar', recouvre: 2000, attente: 9800 },
  { name: 'Avr', recouvre: 2780, attente: 3908 },
  { name: 'Mai', recouvre: 1890, attente: 4800 },
  { name: 'Juin', recouvre: 2390, attente: 3800 },
];

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 fade-in max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dash.overview')}</h2>
        <p className="text-slate-500 mt-1 text-lg">{t('dash.welcome')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('stat.recovered')}
          value="12,450 €" 
          trend="+12%" 
          trendUp={true} 
          icon={<Euro size={24} />}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatCard 
          title={t('stat.pending')} 
          value="3,200 €" 
          trend="+5%" 
          trendUp={false} 
          icon={<AlertTriangle size={24} />}
          color="bg-amber-50 text-amber-600 border-amber-100"
        />
        <StatCard 
          title={t('stat.processed')}
          value="48" 
          icon={<CheckCircle size={24} />}
          color="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard 
          title={t('stat.savings')} 
          value="~4,500 €" 
          icon={<TrendingUp size={24} />}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-900">{t('chart.performance')}</h3>
             <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100 transition">
               <option>Cette année</option>
               <option>6 derniers mois</option>
             </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar dataKey="recouvre" name="Recouvré" fill="#1A73E8" radius={[6, 6, 6, 6]} barSize={32} />
                <Bar dataKey="attente" name="En Attente" fill="#e2e8f0" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">{t('chart.actions')}</h3>
            <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-white rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Urgent • J+20</span>
                <span className="text-slate-400 text-xs">Aujourd'hui</span>
              </div>
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-sm font-bold text-slate-900">Agency Design Paris</p>
                    <p className="text-xs text-slate-500">Facture #F2024-098 • 1,200 €</p>
                 </div>
                 <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight size={18} />
                 </button>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50">
                 <button className="w-full py-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow-sm shadow-red-200">
                  Générer Mise en demeure
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
               <div className="absolute left-0 top-0 w-1 h-full bg-amber-500"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Relance • J+10</span>
                <span className="text-slate-400 text-xs">Hier</span>
              </div>
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-sm font-bold text-slate-900">Startup XYZ</p>
                    <p className="text-xs text-slate-500">Facture #F2024-102 • 450 €</p>
                 </div>
                 <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight size={18} />
                 </button>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-50">
                 <button className="w-full py-2 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition shadow-sm shadow-amber-200">
                  Envoyer Email Ferme
                </button>
              </div>
            </div>
          </div>
          
          <button className="mt-4 w-full text-center text-sm font-medium text-slate-500 hover:text-primary py-2">
            Voir tout
          </button>
        </div>
      </div>
    </div>
  );
};