export type {
  User,
  ServiceCategory,
  ServiceRequest,
  AiAnalysis,
  RepairStep,
  TechnicianInfo,
  RequestOffer,
  JobInfo,
  JobPart,
  InvoiceInfo,
  PaymentInfo,
  PaymentMethod,
  ReviewInfo,
  AppNotification,
  Urgency,
  RequestStatus,
  OfferStatus,
  Availability
} from '../../core/models/shared.models';

export interface ProblemReportPayload {
  categoryId: string;
  category: string;
  description: string;
  accessTime: string;
  photo?: File | null;
  photoPreview?: string | null;
}

export interface BookingOptionsPayload {
  mode: 'auto' | 'manual';
  technicianId?: string;
}
