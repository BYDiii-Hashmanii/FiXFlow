export type RequestUrgency = 'Low' | 'Medium urgency' | 'High urgency' | '';
export type RequestCategory = string;
export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  distance: string;
  avatarInitials: string;
}

export interface JobRequest {
  id: string;
  offerId: string;
  title: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  customer: CustomerInfo;
  accessTime: string;
  description: string;
  detectedDisplayName?: string | null;
  detectionConfidence?: number | null;
  estimatedPay: number;
  photoUrl: string;
  status: RequestStatus;
  declineReason?: string;
  declineNote?: string;
  createdAt: string;
}
