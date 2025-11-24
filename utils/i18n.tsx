import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Sidebar & Navigation
  'app.name': { fr: 'Cash-flow AI', en: 'Cash-flow AI' },
  'nav.dashboard': { fr: 'Tableau de Bord', en: 'Dashboard' },
  'nav.recovery': { fr: 'Recouvrement', en: 'Recovery' },
  'nav.admin': { fr: 'Bureaucratie Killer', en: 'Bureaucracy Killer' },
  'nav.compliance': { fr: 'Conformité', en: 'Compliance' },
  'nav.settings': { fr: 'Paramètres', en: 'Settings' },
  'nav.account': { fr: 'Mon Compte', en: 'My Account' },
  'nav.logout': { fr: 'Déconnexion', en: 'Logout' },

  // Dashboard
  'dash.overview': { fr: "Vue d'ensemble", en: 'Overview' },
  'dash.welcome': { fr: "Bienvenue, voici la santé financière de votre activité.", en: "Welcome, here is your business financial health." },
  'stat.recovered': { fr: "Montant Recouvré", en: "Amount Recovered" },
  'stat.pending': { fr: "En Attente", en: "Pending" },
  'stat.processed': { fr: "Factures Traitées", en: "Invoices Processed" },
  'stat.savings': { fr: "Économie Avocat", en: "Legal Savings" },
  'chart.performance': { fr: "Performance de Recouvrement", en: "Recovery Performance" },
  'chart.actions': { fr: "Actions Requises", en: "Actions Required" },

  // Recovery
  'rec.title': { fr: "Recouvrement Intelligent", en: "Smart Recovery" },
  'rec.subtitle': { fr: "Automatisez vos relances avec l'IA.", en: "Automate your dunning process with AI." },
  'rec.new': { fr: "Nouvelle Procédure", en: "New Procedure" },
  'rec.list': { fr: "Liste", en: "List" },
  'rec.step1': { fr: "Ingestion de la Facture", en: "Invoice Ingestion" },
  'rec.step1_desc': { fr: "Copiez le texte de votre facture pour que l'IA analyse les données.", en: "Copy your invoice text for AI analysis." },
  'rec.analyze_btn': { fr: "Analyser et Générer", en: "Analyze & Generate" },
  'rec.analyzing': { fr: "Analyse en cours...", en: "Analyzing..." },
  'rec.step2': { fr: "Validation des Données", en: "Data Validation" },
  'rec.step3': { fr: "Séquence de Relance (IA)", en: "Dunning Sequence (AI)" },
  'rec.activate': { fr: "Activer l'Automatisation", en: "Activate Automation" },
  'rec.cancel': { fr: "Annuler", en: "Cancel" },
  
  // Admin Tools
  'admin.title': { fr: "Bureaucratie Killer", en: "Bureaucracy Killer" },
  'admin.subtitle': { fr: "Déléguez la complexité administrative à l'IA.", en: "Delegate administrative complexity to AI." },
  'tool.fine': { fr: "Contestation Amendes", en: "Fine Dispute" },
  'tool.fine_desc': { fr: "Générez une lettre juridique pour contester une majoration.", en: "Generate a legal letter to dispute a fine." },
  'tool.visa': { fr: "Assistant Visa", en: "Visa Assistant" },
  'tool.visa_desc': { fr: "Lettres de motivation pour Passeport Talent.", en: "Cover letters for Talent Passport." },
  'tool.review': { fr: "E-Réputation", en: "E-Reputation" },
  'tool.review_desc': { fr: "Réponses diplomatiques aux avis négatifs.", en: "Diplomatic responses to negative reviews." },
  'tool.generate': { fr: "Générer le Document", en: "Generate Document" },
  'tool.context': { fr: "Contexte de la demande", en: "Request Context" },

  // Compliance
  'comp.title': { fr: "Centre de Conformité", en: "Compliance Center" },
  'comp.legal_status': { fr: "Statut Juridique", en: "Legal Status" },
  'comp.legal_text': { fr: "Cash-flow AI n'est pas un cabinet de recouvrement. Nous sommes un éditeur de logiciel (SaaS) d'aide à la rédaction.", en: "Cash-flow AI is not a debt collection agency. We are a software provider (SaaS) assisting in drafting." },
  'comp.funds': { fr: "Gestion des Fonds", en: "Fund Management" },
  'comp.funds_text': { fr: "Nous ne touchons jamais les fonds recouvrés. Les paiements se font directement du débiteur vers votre compte bancaire.", en: "We never touch recovered funds. Payments are made directly from the debtor to your bank account." },

  // Settings
  'set.title': { fr: "Paramètres", en: "Settings" },
  'set.language': { fr: "Langue de l'interface", en: "Interface Language" },
  'set.notifications': { fr: "Notifications", en: "Notifications" },
  'set.api': { fr: "Configuration API", en: "API Configuration" },

  // Account
  'acc.title': { fr: "Mon Compte", en: "My Account" },
  'acc.plan': { fr: "Votre Plan", en: "Your Plan" },
  'acc.usage': { fr: "Utilisation", en: "Usage" },
  
  // Landing
  'land.hero_title': { fr: "Récupérez votre trésorerie, sans effort.", en: "Recover your cash flow, effortlessly." },
  'land.hero_sub': { fr: "L'IA qui gère vos impayés et votre administratif pendant que vous dormez.", en: "The AI that handles your unpaid invoices and admin while you sleep." },
  'land.cta': { fr: "Commencer Gratuitement", en: "Start for Free" },
  'land.feat1': { fr: "Recouvrement Automatique", en: "Automatic Recovery" },
  'land.feat2': { fr: "Assistant Administratif", en: "Admin Assistant" },
  'land.feat3': { fr: "100% Légal & Sécurisé", en: "100% Legal & Secure" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};