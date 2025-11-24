import React from 'react';
import { Euro, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
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
    <div className="space-y-6 fade-in">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">{t('dash.overview')}</h2>
        <p className="text-slate-500">{t('dash.welcome')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('stat.recovered')}
          value="12,450 €" 
          trend="+12%" 
          trendUp={true} 
          icon={<Euro className="text-emerald-600" size={24} />}
          color="bg-emerald-100"
        />
        <StatCard 
          title={t('stat.pending')} 
          value="3,200 €" 
          trend="+5%" 
          trendUp={false} 
          icon={<AlertTriangle className="text-amber-600" size={24} />}
          color="bg-amber-100"
        />
        <StatCard 
          title={t('stat.processed')}
          value="48" 
          icon={<CheckCircle className="text-blue-600" size={24} />}
          color="bg-blue-100"
        />
        <StatCard 
          title={t('stat.savings')} 
          value="~4,500 €" 
          icon={<TrendingUp className="text-indigo-600" size={24} />}
          color="bg-indigo-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t('chart.performance')}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="recouvre" name="Recouvré" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attente" name="En Attente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t('chart.actions')}</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-600 px-2 py-1 bg-white rounded uppercase">J+20</span>
                <span className="text-sm text-slate-500">Mise en demeure</span>
              </div>
              <p className="text-sm font-medium text-slate-900">Client: Agency Design Paris</p>
              <p className="text-xs text-slate-500 mb-3">Facture #F2024-098 • 1,200 €</p>
              <button className="w-full py-2 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition">
                PDF
              </button>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600 px-2 py-1 bg-white rounded uppercase">J+10</span>
                <span className="text-sm text-slate-500">Relance Ferme</span>
              </div>
              <p className="text-sm font-medium text-slate-900">Client: Startup XYZ</p>
              <p className="text-xs text-slate-500 mb-3">Facture #F2024-102 • 450 €</p>
              <button className="w-full py-2 text-xs font-semibold text-white bg-amber-500 rounded hover:bg-amber-600 transition">
                Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};