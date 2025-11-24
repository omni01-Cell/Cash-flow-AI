import React from 'react';
import { ArrowRight, CheckCircle, Shield, Zap, FileText, Globe, Star, PieChart, Activity } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const LandingPage: React.FC<{ onNavigateToAuth: () => void }> = ({ onNavigateToAuth }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-surface min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold text-secondary tracking-tight">
              Cash-flow<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onNavigateToAuth}
              className="hidden md:block text-slate-600 hover:text-primary font-medium transition"
            >
              Connexion
            </button>
            <button 
              onClick={onNavigateToAuth}
              className="bg-secondary text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition font-medium shadow-lg shadow-slate-900/20 flex items-center gap-2 group"
            >
              {t('land.cta')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent -z-10"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
              <Star size={12} className="fill-current" />
              Nouveau: Recouvrement IA v2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-secondary mb-6 leading-[1.1] tracking-tight">
              {t('land.hero_title')}
            </h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
              {t('land.hero_sub')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onNavigateToAuth}
                className="bg-primary text-white text-lg px-8 py-4 rounded-full hover:bg-blue-700 transition shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                Commencer Gratuitement
                <ArrowRight size={20} />
              </button>
              <button className="bg-white text-slate-700 text-lg px-8 py-4 rounded-full border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center gap-2">
                Voir la démo
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(64+i)}
                  </div>
                ))}
              </div>
              <p>Rejoignez 2,000+ freelances</p>
            </div>
          </div>

          {/* 3D Dashboard Mockup */}
          <div className="relative perspective-1000 hidden lg:block animate-float">
            <div className="relative rotate-y-12 transition-transform duration-500 hover:rotate-y-0">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-lg mx-auto z-10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <div className="text-2xl font-bold text-secondary">12,450 €</div>
                    <div className="text-sm text-slate-400">Recouvré ce mois-ci</div>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <Activity />
                  </div>
                </div>
                
                {/* Simulated Chart */}
                <div className="flex items-end gap-2 h-32 mb-8">
                  {[40, 65, 30, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/10 rounded-t-sm relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-1000"
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Simulated List */}
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        <div className="w-24 h-2 bg-slate-200 rounded"></div>
                      </div>
                      <div className="w-12 h-2 bg-green-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -right-12 top-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mise en demeure</div>
                    <div className="text-[10px] text-slate-500">Généré par IA</div>
                  </div>
                </div>
              </div>

               {/* Floating Element 2 */}
               <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-primary rounded-lg">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Relance envoyée</div>
                    <div className="text-[10px] text-slate-500">J+3 (Automatique)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <div className="py-10 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {['Acme Corp', 'Global Solutions', 'TechStart', 'Design Studio', 'Freelance Union'].map(brand => (
               <span key={brand} className="text-xl font-bold text-slate-800">{brand}</span>
             ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-slate-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6 tracking-tight">
              Tout ce dont vous avez besoin pour <span className="text-primary">sécuriser votre CA</span>
            </h2>
            <p className="text-lg text-slate-500">
              Une suite d'outils puissants conçus spécifiquement pour les indépendants et TPE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={28} />,
                bg: 'bg-amber-100',
                text: 'text-amber-600',
                gradient: 'from-amber-400 to-orange-500',
                title: t('land.feat1'),
                desc: "Workflows intelligents qui adaptent le ton selon le retard et le profil client."
              },
              {
                icon: <FileText size={28} />,
                bg: 'bg-violet-100',
                text: 'text-violet-600',
                gradient: 'from-violet-400 to-purple-500',
                title: t('land.feat2'),
                desc: "Générez des courriers juridiques et administratifs complexes en quelques secondes."
              },
              {
                icon: <Shield size={28} />,
                bg: 'bg-emerald-100',
                text: 'text-emerald-600',
                gradient: 'from-emerald-400 to-green-500',
                title: t('land.feat3'),
                desc: "Vos données sont chiffrées. Nous ne touchons jamais vos fonds directement."
              }
            ].map((feat, idx) => (
              <div key={idx} className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Gradient Border Top */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Background Glow */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-10 blur-3xl rounded-full transition-all duration-700 group-hover:scale-150`}></div>

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${feat.bg} ${feat.text} mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                  {feat.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-8">
                  {feat.desc}
                </p>

                <div className="flex items-center text-sm font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">
                  <span>En savoir plus</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-secondary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
            Prêt à récupérer votre argent ?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Rejoignez les milliers de freelances qui dorment mieux la nuit grâce à Cash-flow AI.
          </p>
          <button 
            onClick={onNavigateToAuth}
            className="bg-white text-secondary text-lg font-bold px-10 py-4 rounded-full hover:bg-slate-100 transition shadow-2xl relative z-10"
          >
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center text-white font-bold text-xs">C</div>
            <span className="font-bold text-secondary">Cash-flow AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-primary">Conditions</a>
            <a href="#" className="hover:text-primary">Confidentialité</a>
            <a href="#" className="hover:text-primary">Support</a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-slate-400">
            &copy; 2024 Cash-flow AI. Paris, France.
          </div>
        </div>
      </footer>
    </div>
  );
};