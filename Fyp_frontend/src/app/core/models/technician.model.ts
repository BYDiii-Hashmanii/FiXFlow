export interface Technician {
  id: string;
  name: string;
  initials: string;
  company: string;
  phone: string;
  email: string | null;
  title: string;
  rating: number | null;
  totalReviews: number;
  serviceCategories: string[];
  serviceArea: string | null;
  isAvailable: boolean;
  todayEarnings: number;
  activeJobsCount: number;
  pendingRequestsCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'request' | 'invoice' | 'payment' | 'info' | 'rating';
  unread: boolean;
  link?: string | null;
}

export interface ScheduleItem {
  id: string;
  jobId: string;
  title: string;
  customerName: string;
  address: string;
  timeSlot: string;
  date: string;
  isToday: boolean;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface FeedbackItem {
  id: string;
  customerName: string;
  customerInitials: string;
  rating: number;
  date: string;
  jobTitle: string;
  comment: string;
}
