import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobTrackingService, TrackingInfo } from '../../services/job-tracking.service';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';

const statusLabels: Record<TrackingInfo['status'], string> = {
  ai_analysis: 'Ready to book', waiting: 'Waiting for technician', declined: 'Technician declined',
  accepted: 'Accepted', in_progress: 'Work in progress', completed: 'Work completed',
  closed_paid: 'Closed and paid', cancelled: 'Cancelled', solved_by_customer: 'Solved',
};

@Component({
  selector: 'app-track-job',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="tracking card">
      @if (statusError()) {
        <p role="alert">{{ statusError() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try again</button>
      } @else if (record(); as request) {
        <h1>{{ request.title || 'Track request' }}</h1>
        <p>#{{ request.requestId }}</p>
        <p role="status">{{ labels[request.status] }}</p>
        @if (request.technician; as technician) {
          <p>{{ technician.name }} · {{ technician.company }}</p>
        }
        @if (request.declineReason) {
          <p>Reason: {{ request.declineReason.replaceAll('_', ' ') }}</p>
        }
        <ol>
          @for (event of events(request); track event.title) {
            @if (event.when) {
              <li>{{ event.title }} <time>{{ event.when | date:'medium' }}</time></li>
            }
          }
        </ol>
        <div class="actions">
          @if (request.retryAllowed || request.status === 'ai_analysis') {
            <a class="btn btn-primary" [routerLink]="['/customer/booking', request.requestId, 'choose']">Choose a technician</a>
          }
          @if (request.invoiceId) {
            <a class="btn btn-primary" [routerLink]="['/customer/invoices', request.invoiceId]">View invoice</a>
          } @else if (request.invoiceEligible) {
            <p>The technician can now issue the invoice.</p>
          }
          <button class="btn btn-secondary" (click)="load()" [disabled]="loading()">Refresh</button>
          <a class="btn btn-secondary" routerLink="/customer/requests">My requests</a>
        </div>
      } @else {
        <p role="status">Loading request…</p>
      }
    </section>
  `,
  styles: [`
    .tracking { max-width: 44rem; margin: 1rem auto; padding: clamp(1rem, 4vw, 2rem); }
    ol { padding-inline-start: 1.25rem; }
    time { margin-inline-start: .5rem; }
    .actions { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
  `],
})
export class TrackJobComponent implements OnInit {
  private readonly tracking = inject(JobTrackingService);
  private readonly route = inject(ActivatedRoute);
  private readonly header = inject(HeaderService);
  private readonly destroy = inject(DestroyRef);
  readonly record = signal<TrackingInfo | null>(null);
  readonly statusError = signal('');
  readonly loading = signal(false);
  readonly labels = statusLabels;

  ngOnInit(): void {
    this.header.setHeader({ title: 'Track Job', showBack: true, backUrl: '/customer/requests', showBell: true });
    this.load();
  }

  events(record: TrackingInfo) {
    const time = record.timeline;
    return [
      { title: 'Offer sent', when: time.sentAt },
      { title: 'Technician responded', when: time.respondedAt },
      { title: 'Request accepted', when: time.acceptedAt },
      { title: 'Work started', when: time.startedAt },
      { title: 'Work completed', when: time.completedAt },
      { title: 'Closed', when: time.closedAt },
    ];
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || this.loading()) return;
    this.loading.set(true);
    this.statusError.set('');
    this.tracking.trackJob(id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: result => this.record.set(result),
      error: (error: unknown) => {
        this.statusError.set(errorMessage(error, 'Could not load this request.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
