import { Availability, InvoiceStatus, Role } from '../../core/models/shared.models';

export interface CompanyOwner {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: Role;
  avatarInitials: string;
  company: string;
}

export interface Company {
  id: string;
  name: string;
  ownerName: string;
  totalTechnicians: number;
  activeJobs: number;
  completedJobs: number;
  averageRating: number;
  totalReviews: number;
}

export interface OwnerTechnician {
  categoryId: number;
  id: string;
  name: string;
  phone: string;
  company: string;
  serviceCategory: string;
  serviceRate: number;
  availability: Availability;
  availabilityNote: string;
  rating: number | null;
  createdAt?: string;
  reviewCount: number;
  jobsCompleted: number;
  avatarInitials: string;
}

export interface JobProgressItem {
  label: string;
  time?: string;
  done: boolean;
}

export interface InvoiceLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CompanyJob {
  id: string;
  title: string;
  category: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  technicianId: string;
  technicianName: string;
  date: string;
  total: number;
  status: 'closed_paid' | 'in_progress' | 'closed_unpaid' | 'accepted' | 'completed' | 'cancelled';
  accessTime: string;
  description: string;
  progressSteps: JobProgressItem[];
  invoiceId?: string;
  parts: InvoiceLine[];
  labourCost: number;
}

export interface CompanyInvoice {
  id: string;
  jobId: string;
  jobTitle: string;
  technicianId: string;
  technicianName: string;
  customerId: string;
  customerName: string;
  parts: InvoiceLine[];
  labourCost: number;
  total: number;
  status: InvoiceStatus;
  paymentDate?: string;
  workNotes?: string;
  createdAt: string;
}

export interface CompanyFeedback {
  id: string;
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  jobId: string;
  jobTitle: string;
  invoiceId?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface OwnerNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'feedback' | 'invoice' | 'job' | 'technician' | 'availability';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface OwnerDashboardData {
  greeting: {
    name: string;
    company: string;
    avatarInitials: string;
  };
  stats: {
    totalTechnicians: number;
    activeJobs: number;
    completedJobs: number;
  };
  recentJobs: CompanyJob[];
}

export interface CreateTechnicianPayload {
  password: string;
  fullName: string;
  phone: string;
  categoryId: string;
  serviceRate: number;
  availability: Availability;
}

export interface EditTechnicianPayload {
  fullName: string;
  phone: string;
  categoryId: string;
  serviceRate: number;
  availability: Availability;
}

