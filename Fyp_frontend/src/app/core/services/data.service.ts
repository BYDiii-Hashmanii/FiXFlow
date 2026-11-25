import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { ApiClientService } from '../api/api-client.service';
import { AuthStateService } from '../auth/auth-state.service';
import { errorMessage } from '../interceptors/error.interceptor';
import { Job, JobPart, JobPhoto } from '../models/job.model';
import { JobRequest } from '../models/request.model';
import { AppNotification, OfferStatus, Urgency } from '../models/shared.models';
import { FeedbackItem, NotificationItem, ScheduleItem, Technician } from '../models/technician.model';

interface OfferCard {
  id: string;
  requestId: string;
  title: string | null;
  description: string | null;
  category: string;
  accessTime: string | null;
  photoUrl: string | null;
  customer: { name: string; phone: string | null; address: string | null; avatarInitials: string };
  urgency: Urgency | null;
  offeredPrice: number;
  status: OfferStatus;
  declineReason: string | null;
  createdAt: string;
}

interface WorkUpdate {
  workNotes?: string;
  expectedCompletion?: string;
  labourHours?: number;
  parts?: Pick<JobPart, 'name' | 'quantity' | 'unitPrice'>[];
}

type DeclineReason = 'busy' | 'not_available' | 'outside_area' | 'other';

function requestFromOffer(offer: OfferCard): JobRequest {
  return {
    id: offer.requestId, offerId: offer.id, title: offer.title ?? '', description: offer.description ?? '',
    category: offer.category, accessTime: offer.accessTime ?? '', photoUrl: offer.photoUrl ?? '',
    customer: { ...offer.customer, phone: offer.customer.phone ?? '', address: offer.customer.address ?? '', distance: '' },
    urgency: offer.urgency === 'high' ? 'High urgency' : offer.urgency === 'medium' ? 'Medium urgency' : offer.urgency === 'low' ? 'Low' : '',
    estimatedPay: offer.offeredPrice, status: offer.status, createdAt: offer.createdAt,
    declineReason: offer.declineReason ?? undefined,
  };
}

function notification(note: AppNotification): NotificationItem {
  const type = note.type === 'request' || note.type === 'offer' ? 'request' :
    note.type === 'invoice' || note.type === 'payment' ? note.type : note.type === 'feedback' ? 'rating' : 'info';
  return { id: note.id, title: note.title, message: note.message, time: note.createdAt, type, unread: !note.read, link: note.link };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthStateService);
  private refreshSubscription?: Subscription;
  private mutationSubscription?: Subscription;

  readonly technician = signal<Technician | null>(null);
  readonly requests = signal<JobRequest[]>([]);
  readonly jobs = signal<Job[]>([]);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly schedule = signal<ScheduleItem[]>([]);
  readonly feedbacks = signal<FeedbackItem[]>([]);
  readonly failure = signal('');
  readonly pending = signal(false);
  readonly retry = signal<(() => void) | null>(null);

  readonly unreadNotificationsCount = computed(() => this.notifications().filter(item => item.unread).length);
  readonly pendingRequests = computed(() => this.requests().filter(item => item.status === 'pending'));
  readonly activeJobs = computed(() => this.jobs().filter(job => job.status === 'accepted' || job.status === 'in_progress'));
  readonly completedJobs = computed(() => this.jobs().filter(job => job.status === 'completed' || job.status === 'closed'));

  constructor() {
    effect(() => {
      const user = this.auth.user();
      untracked(() => {
        this.refreshSubscription?.unsubscribe();
        this.mutationSubscription?.unsubscribe();
        this.technician.set(null);
        this.requests.set([]);
        this.jobs.set([]);
        this.notifications.set([]);
        this.schedule.set([]);
        this.feedbacks.set([]);
        this.failure.set('');
        this.pending.set(false);
        this.retry.set(null);
        if (user?.role === 'technician') this.refreshLiveState();
      });
    });
  }

  refreshLiveState(): void {
    if (this.auth.role() !== 'technician') return;
    this.refreshSubscription?.unsubscribe();
    this.failure.set('');
    this.retry.set(null);
    const batch = new Subscription();
    this.refreshSubscription = batch;
    const subscribe = <T>(source: Observable<T>, update: (value: T) => void) => {
      batch.add(source.subscribe({
        next: update,
        error: (error: unknown) => {
          this.failure.set(errorMessage(error, 'Could not refresh the technician portal.'));
          this.retry.set(() => this.refreshLiveState());
        },
      }));
    };
    subscribe(this.api.get<Technician>('/technician/profile'), item => this.technician.set(item));
    subscribe(this.api.get<Job[]>('/jobs'), items => this.jobs.set(items));
    subscribe(this.api.get<OfferCard[]>('/technician/offers'), items => this.requests.set(items.map(requestFromOffer)));
    subscribe(this.api.get<AppNotification[]>('/notifications'), items => this.notifications.set(items.map(notification)));
    subscribe(this.api.get<ScheduleItem[]>('/technician/schedule'), items => this.schedule.set(items));
    subscribe(this.api.get<FeedbackItem[]>('/technician/ratings'), items => this.feedbacks.set(items));
  }

  run<T>(operation: () => Observable<T>, success?: (value: T) => void): void {
    if (this.pending()) return;
    this.pending.set(true);
    this.failure.set('');
    this.retry.set(null);
    this.mutationSubscription = operation().subscribe({
      next: result => success?.(result),
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'The change failed. Please try again.'));
        this.retry.set(() => this.run(operation, success));
        this.pending.set(false);
      },
      complete: () => this.pending.set(false),
    });
  }

  read<T>(source: Observable<T>, success: (value: T) => void): void {
    source.subscribe({
      next: success,
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not load the record.'));
        this.retry.set(() => this.read(source, success));
      },
    });
  }

  getRequestById(id: string) {
    return this.api.get<OfferCard>('/technician/requests/' + encodeURIComponent(id)).pipe(map(requestFromOffer));
  }

  getJobById(id: string) {
    return this.api.get<Job>('/jobs/' + encodeURIComponent(id));
  }

  acceptRequest(request: JobRequest) {
    return this.api.post<unknown>('/offers/' + request.offerId + '/accept', {}).pipe(tap(() => this.refreshLiveState()));
  }

  declineRequest(request: JobRequest, value: string) {
    const reasons: Record<string, DeclineReason> = {
      'Busy with current job': 'busy', 'Not Available at requested time': 'not_available',
      'Outside Service Area': 'outside_area', busy: 'busy', not_available: 'not_available', outside_area: 'outside_area', other: 'other',
    };
    return this.api.post<unknown>('/offers/' + request.offerId + '/decline', {
      reason: reasons[value] ?? 'other',
    }).pipe(tap(() => this.refreshLiveState()));
  }

  startJob(id: string) {
    return this.api.post<Job>('/jobs/' + encodeURIComponent(id) + '/start', {}).pipe(tap(job => this.setJob(job)));
  }

  updateJobWork(id: string, input: WorkUpdate) {
    return this.api.put<Job>('/jobs/' + encodeURIComponent(id) + '/update', input).pipe(tap(job => this.setJob(job)));
  }

  completeJob(id: string) {
    return this.api.post<Job>('/jobs/' + encodeURIComponent(id) + '/complete', {}).pipe(tap(job => this.setJob(job)));
  }

  sendInvoice(id: string) {
    return this.api.post<unknown>('/jobs/' + encodeURIComponent(id) + '/invoice', {}).pipe(
      switchMap(() => this.getJobById(id)), tap(job => this.setJob(job)),
    );
  }

  uploadPhoto(id: string, type: 'before' | 'after', file: File) {
    const form = new FormData();
    form.set('photoType', type);
    form.set('photo', file);
    return this.api.upload<JobPhoto>('/jobs/' + encodeURIComponent(id) + '/photos', form).pipe(
      switchMap(() => this.getJobById(id)), tap(job => this.setJob(job)),
    );
  }

  private setJob(job: Job): void {
    this.jobs.update(items => [job, ...items.filter(item => item.id !== job.id)]);
  }

  markNotificationsRead(): void {
    this.run(() => this.api.post<unknown>('/notifications/read-all', {}), () =>
      this.notifications.update(items => items.map(item => ({ ...item, unread: false }))),
    );
  }

  markNotificationRead(id: string): void {
    this.run(() => this.api.post<unknown>('/notifications/' + encodeURIComponent(id) + '/read', {}), () =>
      this.notifications.update(items => items.map(item => item.id === id ? { ...item, unread: false } : item)),
    );
  }

  toggleAvailability(): void {
    const user = this.technician();
    if (user) {
      this.run(() => this.api.put<Technician>('/technician/availability', {
        availability: user.isAvailable ? 'unavailable' : 'available',
      }), updated => this.technician.set(updated));
    }
  }

  loadProfile(success: (value: Technician) => void): void {
    this.read(this.api.get<Technician>('/technician/profile'), success);
  }

  updateProfile(input: { fullName: string; phone: string; email?: string | null; address?: string }, success?: () => void): void {
    this.run(() => this.api.put<Technician>('/technician/profile', input), updated => {
      this.technician.set(updated);
      success?.();
    });
  }
}
