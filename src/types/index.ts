export type ProjectStatus = 'Pendente' | 'Em Andamento' | 'Concluído';
export type ProjectStage = 'Sessão Fotográfica' | 'Edição' | 'Entrega';
export type PaymentStatus = 'Pago' | 'Não Pago' | 'Parcialmente Pago';

export interface Project {
  id: string;
  clientName: string;
  date: string; // ISO 8601 date string
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

export interface User {
  email: string;
  password?: string;
  name?: string;
  company?: string;
  phone?: string;
  profileComplete?: boolean;
  portfolioSlug?: string;
  profilePictureUrl?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
}
