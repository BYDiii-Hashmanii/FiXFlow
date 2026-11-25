/**
 * Shared Domain Models & Enums for FixFlow Platform
 * (Maps between TypeScript camelCase and DB snake_case columns)
 */

export type UserRole = 'customer' | 'technician' | 'owner' | 'admin';
export type Role = 'customer' | 'technician' | 'owner';

export type RequestStatus =
  | 'ai_analysis'
  | 'solved_by_customer'
  | 'waiting'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'closed_paid'
  | 'cancelled';

export type OfferStatus = 'pending' | 'accepted' | 'declined';
export type InvoiceStatus = 'draft' | 'unpaid' | 'paid';
export type Urgency = 'low' | 'medium' | 'high';
export type Availability = 'available' | 'busy' | 'unavailable';
export type BookingMode = 'auto' | 'manual';

export interface User {
  id: string; // db: id
  fullName: string; // db: full_name
  phone: string; // db: phone
  email?: string; // db: email
  role: UserRole; // db: role
  avatarInitials: string;
  address?: string; // db: address
  createdAt?: string; // db: created_at
}

export interface ServiceCategory {
  id: string; // db: id
  name: string; // db: name (e.g. 'Plumbing', 'Electrical')
  icon: string; // db: icon
  active: boolean; // db: is_active
}

export interface RepairStep {
  stepNo: number; // db: step_no
  instruction: string; // db: instruction
  completed?: boolean;
}

export interface AiAnalysis {
  state: "pending" | "ready" | "no_detection" | "failed";
  provenance: string | null;
  confidence: number | null;
  detectorLabel: string | null;
  detectedCategory: string | null;
  title: string | null; // db: title
  category: string; // db: category
  urgency: Urgency | null; // db: urgency ('medium')
  summary: string | null; // db: summary
  safetyNote: string | null; // db: safety_note
  steps: RepairStep[];
}

export interface TechnicianInfo {
  categoryId: number;
  id: string; // db: id
  name: string; // db: name
  company: string; // db: company_name
  rating: number | null; // db: rating
  reviewCount: number; // db: review_count
  rate: number; // db: rate (e.g. 1800)
  availability: Availability; // db: availability ('available')
  availabilityNote?: string; // e.g. 'Available now', 'Available today, 4 PM'
  avatarInitials: string;
  serviceCategory: string; // db: service_category
  isBestMatch?: boolean;
  distance?: string;
}

export interface ServiceRequest {
  categoryId: number;
  title?: string | null;
  id: string; // db: id (e.g. 'FF-0142')
  customerId: string; // db: customer_id
  customerName: string;
  category: string; // db: category
  description: string; // db: description
  accessTime: string; // db: access_time
  photoUrl?: string | null; // db: photo_url
  urgency: Urgency | null; // db: urgency
  status: RequestStatus; // db: status
  assignedTechnician?: TechnicianInfo | null; // db: assigned_technician_id
  aiAnalysis?: AiAnalysis;
  bookingMode?: BookingMode;
  estimatedPrice?: number | null; // db: estimated_price
  createdAt: string; // db: created_at
  updatedAt?: string; // db: updated_at
}

export interface RequestOffer {
  id: string; // db: id
  requestId: string; // db: request_id
  technicianId: string; // db: technician_id
  technician: TechnicianInfo;
  status: OfferStatus; // db: status
  offeredPrice: number; // db: offered_price
  createdAt: string; // db: created_at
}

export interface JobPart {
  id: string; // db: id
  name: string; // db: name
  quantity: number; // db: quantity
  unitPrice: number; // db: unit_price
  total: number; // db: total
}

export interface JobPhoto {
  id: string;
  type: 'before' | 'after';
  url: string;
}

export interface JobInfo {
  id: string; // db: id
  requestId: string; // db: request_id
  technician: TechnicianInfo;
  customer: User;
  status: 'accepted' | 'in_progress' | 'completed' | 'closed';
  timeline: {
    acceptedAt?: string;
    startedAt?: string;
    completedAt?: string;
  };
  parts: JobPart[];
  labourHours: number;
  labourCost: number;
  totalCost: number;
  workNotes: string;
  photos: JobPhoto[];
}

export interface InvoiceInfo {
  id: string; // db: id (e.g. 'INV-2026-0142')
  jobId: string; // db: job_id
  requestId: string; // db: request_id
  jobTitle: string;
  technician: TechnicianInfo;
  parts: JobPart[];
  labourCost: number; // db: labour_cost
  totalCost: number; // db: total_cost
  status: InvoiceStatus; // db: status ('unpaid', 'paid')
  workNotes: string; // db: work_notes
  createdAt: string; // db: created_at
  paidAt?: string; // db: paid_at
}

export type PaymentMethod = "cash" | "card" | "jazzcash" | "easypaisa" | "bank_transfer";

export interface PaymentInfo {
  id: string; // db: id
  invoiceId: string; // db: invoice_id
  jobId: string;
  requestId: string;
  amount: number; // db: amount
  method: PaymentMethod;
  paidAt: string; // db: paid_at
  receiptNumber: string; // db: receipt_number
}

export interface ReviewInfo {
  id: string; // db: id
  jobId: string; // db: job_id
  customerId: string; // db: customer_id
  customerName: string;
  technicianId: string; // db: technician_id
  rating: number; // db: rating (1-5)
  comment: string; // db: comment
  createdAt: string; // db: created_at
}

export interface AppNotification {
  id: string; // db: id
  userId: string; // db: user_id
  title: string; // db: title
  message: string; // db: message
  type: 'accepted' | 'invoice_ready' | 'payment_received' | 'technician_declined' | 'info' | 'request' | 'offer' | 'job' | 'invoice' | 'payment' | 'feedback' | 'system';
  read: boolean; // db: is_read
  createdAt: string; // db: created_at
  link?: string; // deep link url
}
