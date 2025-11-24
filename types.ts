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
  status: InvoiceStatus;
  riskLevel: 'Faible' | 'Moyen' | 'Élevé';
  lastAction?: string;
}

export interface DunningDraft {
  level: 1 | 2 | 3;
  subject: string;
  body: string;
  tone: 'Empathique' | 'Ferme' | 'Légal';
}

export interface AdminTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
}
