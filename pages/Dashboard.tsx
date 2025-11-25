import React, { useEffect, useState } from 'react';
import { Euro, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../utils/i18n';
import { supabase } from '../services/supabaseClient';
import { Invoice, InvoiceStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    recovered: 0,
    pending: 0,
    processedCount: 0,
    legalSavings: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invoices = data as any[];

      // 1. Calculate KPI Totals
      let recovered = 0;
      let pending = 0;
      let processedCount = invoices.length;

      invoices.forEach(inv => {
        const amt = Number(inv.amount) || 0;
        if (inv.status === InvoiceStatus.PAID) {
          recovered += amt;
        } else if (inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE || inv.status === InvoiceStatus.RECOVERY_STARTED) {
          pending += amt;
        }
      });

      // Estimate Legal Savings: Average cost of a lawyer letter/action ~75€
      // We assume every invoice processed in the app saves one manual legal action interaction
      const legalSavings = processedCount * 75;

      setMetrics({
        recovered,
        pending,
        processedCount,
        legalSavings
      });

      // 2. Prepare Chart Data (Group by Month)
      // We verify the last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          date: d,
          name: d.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }),
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          recouvre: 0,
          attente: 0
        };
      });

      invoices.forEach(inv => {
        const amt = Number(inv.amount) || 0;
        // If paid, use payment_date, otherwise use due_date or created_at
        const dateRef = inv.status === InvoiceStatus.PAID && inv.payment_date 
          ? new Date(inv.payment_date) 
          : new Date(inv.created_at);
        
        const key = `${dateRef.getFullYear()}-${String(dateRef.getMonth() + 1).padStart(2, '0')}`;
        const monthData = last6Months.find(m => m.key === key);

        if (monthData) {
          if (inv.status === InvoiceStatus.PAID) {
            monthData.recouvre += amt;
          } else {
            monthData.attente += amt;
          }
        }
      });

      setChartData(last6Months);

      // 3. Recent Actions (Filter by those needing attention)
      const urgent = invoices
        .filter(inv => inv.status === InvoiceStatus.OVERDUE || inv.status === InvoiceStatus.RECOVERY_STARTED)
        .slice(0, 3)
        .map(inv => ({
          ...inv,
          dueDate: inv.due_date,
          clientName: inv.client_name,
          riskLevel: inv.risk_level
        }));
      
      setRecentActions(urgent);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dash.overview')}</h2>
        <p className="text-slate-500 mt-1 text-lg">{t('dash.welcome')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('stat.recovered')}
          value={`${metrics.recovered.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €`} 
          trend="Total" 
          trendUp={true} 
          icon={<Euro size={24} />}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatCard 
          title={t('stat.pending')} 
          value={`${metrics.pending.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €`} 
          trend="En cours" 
          trendUp={false} 
          icon={<AlertTriangle size={24} />}
          color="bg-amber-50 text-amber-600 border-amber-100"
        />
        <StatCard 
          title={t('stat.processed')}
          value={metrics.processedCount.toString()} 
          icon={<CheckCircle size={24} />}
          color="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard 
          title={t('stat.savings')} 
          value={`~${metrics.legalSavings.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} €`} 
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
               <option>6 derniers mois</option>
             </select>
          </div>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
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
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                Pas assez de données
              </div>
            )}
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">{t('chart.actions')}</h3>
            <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">{recentActions.length}</span>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentActions.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Aucune action urgente requise.</p>
            ) : (
              recentActions.map((action) => (
                <div key={action.id} className="p-4 bg-white rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-red-500"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {action.status === InvoiceStatus.OVERDUE ? 'En Retard' : 'Action Requise'}
                    </span>
                    <span className="text-slate-400 text-xs">{action.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-slate-900">{action.clientName}</p>
                        <p className="text-xs text-slate-500">{Number(action.amount).toLocaleString()} €</p>
                    </div>
                    <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <button className="w-full py-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow-sm shadow-red-200">
                      Générer Relance
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="mt-4 w-full text-center text-sm font-medium text-slate-500 hover:text-primary py-2">
            Voir tout
          </button>
        </div>
      </div>
    </div>
  );
};