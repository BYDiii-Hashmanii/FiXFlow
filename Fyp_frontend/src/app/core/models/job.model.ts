import { CustomerInfo, RequestCategory } from './request.model';

export type JobStatus = 'accepted' | 'in_progress' | 'completed' | 'closed' | 'cancelled';
export type PaymentStatus = 'draft' | 'unpaid' | 'paid';

export interface JobPart {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface JobTimelineStep {
  title: string;
  time: string;
  completed: boolean;
}

export interface JobPhoto {
  id: string;
  type: "before" | "after" | "progress";
  url: string;
  uploadedAt: string;
}

export interface Job {
  id: string;
  requestId: string;
  title: string;
  category: RequestCategory;
  customer: CustomerInfo;
  accessTime: string;
  scheduledDate: string;
  description: string;
  photoUrl: string;
  status: JobStatus;
  workStatusNote: string;
  expectedCompletion: string;
  parts: JobPart[];
  labourHours: number;
  hourlyRate: number;
  labourCost: number;
  totalCost: number;
  workNotes: string;
  photos: JobPhoto[];
  invoiceNumber: string | null;
  invoiceDate: string | null;
  paymentStatus: PaymentStatus | null;
  rating?: number;
  reviewComment?: string;
  timeline: JobTimelineStep[];
}
