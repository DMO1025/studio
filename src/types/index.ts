export type ProjectStatus = 'Pendente' | 'Em Andamento' | 'Concluído';
export type ProjectStage = 'Sessão Fotográfica' | 'Edição' | 'Entrega';
export type PaymentStatus = 'Pago' | 'Não Pago' | 'Parcialmente Pago';

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
  galleryImages?: string[];
}
