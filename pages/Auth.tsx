import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onLogin: () => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });
        if (error) throw error;
        
        // Create or update initial profile
        // Using upsert to avoid conflicts if a database trigger already created the profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              { id: data.user.id, name, email }
            ], { onConflict: 'id' });
          
          if (profileError) {
            console.error("Profile creation/update failed:", profileError.message);
          }
        }
      }
      
      // onLogin prop isn't strictly needed as App.tsx listens to auth state, 
      // but we call it for immediate feedback if needed.
      onLogin(); 
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex fade-in">
      {/* Left Panel - Visual & Testimonial */}
      <div className="hidden lg:flex w-1/2 bg-secondary relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-secondary opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
             <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold tracking-tight">Cash-flow AI</span>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            L'automatisation financière <br/>
            pour les entrepreneurs <br/>
            exigeants.
          </h2>
          
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-center gap-3">
              <CheckCircle className="text-accent" size={20} />
              <span>Recouvrement amiable et judiciaire automatisé</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="text-accent" size={20} />
              <span>Génération de documents administratifs par IA</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="text-accent" size={20} />
              <span>Tableau de bord financier temps réel</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <p className="text-lg italic mb-4">
            "Depuis que j'utilise Cash-flow AI, j'ai divisé mes impayés par 3 et je ne perds plus de temps avec l'administratif. C'est un game changer."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full"></div>
            <div>
              <div className="font-bold">Sophie Martin</div>
              <div className="text-xs text-slate-400">Freelance UX Designer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 lg:left-auto lg:right-12 flex items-center text-slate-400 hover:text-secondary transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retour au site
        </button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Bon retour parmi nous' : 'Créer un compte'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Entrez vos identifiants pour accéder à votre espace.' : 'Commencez votre essai gratuit de 14 jours.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Email professionnel</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="nom@entreprise.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
                {isLogin && <a href="#" className="text-sm font-medium text-primary hover:text-blue-700">Oublié ?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                isLogin ? 'Se connecter' : "S'inscrire gratuitement"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
              <button
                onClick={() => {
                   setIsLogin(!isLogin);
                   setErrorMsg(null);
                }}
                className="ml-2 font-bold text-primary hover:text-blue-700 transition-colors"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};