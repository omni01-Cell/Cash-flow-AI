export enum InvoiceStatus {
  PENDING = 'En attente',
  OVERDUE = 'En retard',
  PAID = 'Payée',
  DISPUTED = 'Contestée',
  RECOVERY_STARTED = 'Recouvrement actif'
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  paymentDate?: string | null;
  status: InvoiceStatus;
  riskLevel: 'Faible' | 'Moyen' | 'Élevé';
  lastAction?: string;
  aiAnalysis?: string;
  recommendedAction?: string;
  actionType?: 'email' | 'legal' | 'call';
  // New file fields
  fileUrl?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}

export interface DunningDraft {
  level: 1 | 2 | 3;
  subject: string;
  body: string;
  tone: 'Empathique' | 'Ferme' | 'Légal';
}

export interface UserProfile {
  name: string;
  email: string;
  plan: string;
  avatar: string | null;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}

export interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
}

export interface ActivityLog {
  id: string;
  type: 'email_sent' | 'payment' | 'mail_sent' | 'invoice_created' | 'system';
  created_at: string; // Mapping from DB 'created_at'
  description: string;
  amount?: number | null;
  status: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}