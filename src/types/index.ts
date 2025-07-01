export type ProjectStatus = 'Backlog' | 'In Progress' | 'Complete';
export type ProjectStage = 'Shooting' | 'Editing' | 'Delivery';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partially Paid';

export interface Project {
  id: string;
  clientName: string;
  date: string; // ISO string date
  location: string;
  photographer: string;
  status: ProjectStatus;
  stage: ProjectStage;
  income: number;
  expenses: number;
  paymentStatus: PaymentStatus;
  description: string;
  imageUrl?: string;
}
