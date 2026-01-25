import React, { useEffect, useState } from 'react';
import { Euro, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, Loader2, PieChart as PieChartIcon, Activity, BarChart as BarChartIcon, ScatterChart as ScatterChartIcon, Radar as RadarIcon, Map as MapIcon } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useLanguage } from '../utils/i18n';
import { supabase } from '../services/supabaseClient';
import { Invoice, InvoiceStatus } from '../types';

interface DashboardProps {
  userId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    recovered: 0,
    pending: 0,
    processedCount: 0,
    legalSavings: 0
  });

  // Chart States
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [treemapData, setTreemapData] = useState<any[]>([]);

  const [recentActions, setRecentActions] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    // Ideally we would use userId here to fetch data specific to the user
    console.log('Fetching dashboard data for user:', userId);
    try {
      // Mock Data for Visualization Verification
      const invoices = [
        { id: '1', amount: 1500, status: 'Payée', created_at: '2024-01-15', payment_date: '2024-01-20', client_name: 'Tech Corp', due_date: '2024-01-30', risk_level: 'Faible' },
        { id: '2', amount: 2300, status: 'En retard', created_at: '2024-02-10', client_name: 'Studio Design', due_date: '2024-02-28', risk_level: 'Moyen' },
        { id: '3', amount: 4500, status: 'Payée', created_at: '2024-03-05', payment_date: '2024-03-15', client_name: 'Global Inc', due_date: '2024-03-20', risk_level: 'Faible' },
        { id: '4', amount: 1200, status: 'En attente', created_at: '2024-04-01', client_name: 'StartUp One', due_date: '2024-04-15', risk_level: 'Faible' },
        { id: '5', amount: 800, status: 'Recouvrement actif', created_at: '2024-03-20', client_name: 'Freelance Guy', due_date: '2024-04-05', risk_level: 'Élevé' },
        { id: '6', amount: 3000, status: 'Payée', created_at: '2024-05-12', payment_date: '2024-05-25', client_name: 'Big Agency', due_date: '2024-05-30', risk_level: 'Faible' },
      ] as any[];

      // const { data, error } = await supabase
      //   .from('invoices')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;

      // const invoices = data as any[];

      // --- 1. KPI Totals ---
      let recovered = 0;
      let pending = 0;

      invoices.forEach(inv => {
        const amt = Number(inv.amount) || 0;
        if (inv.status === InvoiceStatus.PAID) {
          recovered += amt;
        } else if (inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE || inv.status === InvoiceStatus.RECOVERY_STARTED) {
          pending += amt;
        }
      });

      const legalSavings = invoices.length * 75;

      setMetrics({
        recovered,
        pending,
        processedCount: invoices.length,
        legalSavings
      });

      // --- 2. Chart Data Preparation ---

      // A. Bar Chart & Line Chart (Monthly Evolution)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          date: d,
          name: d.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }),
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          recouvre: 0,
          attente: 0,
          cumulRecouvre: 0
        };
      });

      let runningTotal = 0;
      // Sort invoices by date for line chart running total
      const sortedInvoices = [...invoices].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      sortedInvoices.forEach(inv => {
        const amt = Number(inv.amount) || 0;
        const dateRef = inv.status === InvoiceStatus.PAID && inv.payment_date 
          ? new Date(inv.payment_date) 
          : new Date(inv.created_at);
        
        const key = `${dateRef.getFullYear()}-${String(dateRef.getMonth() + 1).padStart(2, '0')}`;
        const monthData = last6Months.find(m => m.key === key);

        if (monthData) {
          if (inv.status === InvoiceStatus.PAID) {
            monthData.recouvre += amt;
            runningTotal += amt;
          } else {
            monthData.attente += amt;
          }
        }
        // Update cumulative for all months after this date?
        // Simpler: Just map running total to the months after aggregation
      });

      // Fix cumulative sum for line chart
      let cumSum = 0;
      const lineData = last6Months.map(m => {
        cumSum += m.recouvre;
        return { ...m, cumulRecouvre: cumSum };
      });

      setBarChartData(last6Months);
      setLineChartData(lineData);

      // B. Pie Chart (Status Distribution)
      const statusCounts: Record<string, number> = {};
      invoices.forEach(inv => {
        const s = inv.status || 'Inconnu';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      const pieData = Object.keys(statusCounts).map(key => ({
        name: key,
        value: statusCounts[key]
      }));
      setPieChartData(pieData);

      // C. Scatter Plot (Amount vs Overdue Days)
      const scatter = invoices
        .filter(inv => inv.status === InvoiceStatus.OVERDUE || inv.status === InvoiceStatus.RECOVERY_STARTED)
        .map(inv => {
          const due = new Date(inv.due_date);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - due.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            x: diffDays, // Days Overdue
            y: Number(inv.amount), // Amount
            z: 1, // Size
            name: inv.client_name
          };
        });
      // Mock some scatter data if empty
      if (scatter.length === 0) {
        scatter.push(
            { x: 5, y: 1500, z: 1, name: 'Client A' },
            { x: 15, y: 3200, z: 1, name: 'Client B' },
            { x: 30, y: 800, z: 1, name: 'Client C' },
            { x: 45, y: 5000, z: 1, name: 'Client D' },
        );
      }
      setScatterData(scatter);

      // D. Radar Chart (Metrics)
      // Mock metrics for "Health Score"
      const radar = [
        { subject: 'Vitesse', A: 120, fullMark: 150 },
        { subject: 'Volume', A: 98, fullMark: 150 },
        { subject: 'Succès', A: 86, fullMark: 150 },
        { subject: 'Rétention', A: 99, fullMark: 150 },
        { subject: 'Juridique', A: 85, fullMark: 150 },
        { subject: 'Satisfaction', A: 65, fullMark: 150 },
      ];
      setRadarData(radar);

      // E. Treemap (Clients by Volume)
      const clientMap: Record<string, number> = {};
      invoices.forEach(inv => {
        const name = inv.client_name || 'Inconnu';
        clientMap[name] = (clientMap[name] || 0) + Number(inv.amount);
      });
      const treemap = Object.keys(clientMap).map((name, index) => ({
        name,
        size: clientMap[name],
        fill: `hsl(${index * 45}, 70%, 50%)`
      })).slice(0, 10); // Top 10

      if (treemap.length === 0) {
           // Mock
           treemap.push(
               { name: 'Acme Corp', size: 12000, fill: '#8884d8' },
               { name: 'Globex', size: 8500, fill: '#83a6ed' },
               { name: 'Soylent', size: 6000, fill: '#8dd1e1' },
               { name: 'Initech', size: 3000, fill: '#82ca9d' },
           );
      }

      setTreemapData(treemap);


      // 3. Recent Actions
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in max-w-7xl mx-auto pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dash.overview')}</h2>
        <p className="text-slate-500 mt-1 text-lg">{t('dash.welcome')}</p>
      </header>

      {/* KPI Cards */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* 1. Bar Chart (Frequencies/Comparisons) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChartIcon size={18} /></div>
             <h3 className="font-bold text-slate-900">Performance Mensuelle</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="recouvre" name="Recouvré" fill="#1A73E8" radius={[4, 4, 4, 4]} />
                  <Bar dataKey="attente" name="En Attente" fill="#e2e8f0" radius={[4, 4, 4, 4]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Pie Chart (Proportions) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><PieChartIcon size={18} /></div>
             <h3 className="font-bold text-slate-900">Distribution par Statut</h3>
          </div>
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Line Chart (Time Evolution) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Activity size={18} /></div>
             <h3 className="font-bold text-slate-900">Évolution Cumulée (Recouvrement)</h3>
          </div>
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="cumulRecouvre" name="Total Recouvré" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981'}} activeDot={{r: 8}} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Scatter Plot (Correlations) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><ScatterChartIcon size={18} /></div>
             <h3 className="font-bold text-slate-900">Corrélation (Montant / Retard)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Jours de retard" unit="j" tick={{fontSize: 10}} />
                <YAxis type="number" dataKey="y" name="Montant" unit="€" tick={{fontSize: 10}} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Scatter name="Factures" data={scatterData} fill="#EC4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* 5. Radar Chart (Analysis) */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><RadarIcon size={18} /></div>
             <h3 className="font-bold text-slate-900">Santé Financière</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                <Radar name="Performance" dataKey="A" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Treemap (Complex Analysis) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><MapIcon size={18} /></div>
             <h3 className="font-bold text-slate-900">Volume par Client (Treemap)</h3>
          </div>
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  width={400}
                  height={200}
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                >
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                </Treemap>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
