import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { forkJoin, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { ServiceRequest, TechnicianInfo } from '../../models/customer.models';
import { JobTrackingService } from '../../services/job-tracking.service';
import { RequestService } from '../../services/request.service';
import { TechnicianService } from '../../services/technician.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-choose-technician',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Choose Technician</h1>
      @if (request(); as item) {
        <div class="flow-chips" aria-label="Technician filters">
          <button [disabled]="loading()" [attr.aria-pressed]="categoryOnly()" (click)="categoryOnly.set(!categoryOnly()); load()">{{ item.category }}</button>
          <button [disabled]="loading() || bestMatch()" [attr.aria-pressed]="availableOnly() || bestMatch()" (click)="availableOnly.set(!availableOnly()); load()">Available</button>
          <button [disabled]="loading()" [attr.aria-pressed]="bestMatch()" (click)="bestMatch.set(!bestMatch()); load()">Best match</button>
        </div>
      }
      @if (sendFailure()) { <p class="flow-warning" role="alert">{{ sendFailure() }}</p> }
      @if (failure()) {
        <p role="alert">{{ failure() }}</p>
        <button class="btn btn-secondary" (click)="load()">Try again</button>
      } @else if (loading()) {
        <p role="status">Loading technicians…</p>
      } @else {
        @for (tech of technicians(); track tech.id) {
          <article class="card flow-card flow-stack">
            <div class="flow-person"><span class="flow-avatar">{{ tech.avatarInitials }}</span><div>
              <strong>{{ tech.name }}</strong>
              <p class="flow-muted">{{ tech.company }}</p>
              <p>★ {{ tech.rating ?? 'N/A' }} ({{ tech.reviewCount }} reviews)</p>
            </div></div>
            <div class="flow-row"><strong>Rs {{ tech.rate | number }}</strong>
              <span class="flow-badge" [class.flow-success]="tech.availability === 'available'">{{ tech.availability === 'available' ? 'Available now' : (tech.availability | titlecase) }}</span>
            </div>
            <button class="btn btn-primary" [disabled]="tech.availability !== 'available' || tech.categoryId !== request()?.categoryId || sending() !== null" (click)="send(tech)">
              {{ sending() === tech.id ? 'Sending…' : 'Request Technician' }}
            </button>
          </article>
        } @empty { <p>No technicians match these filters.</p> }
      }
      <a [routerLink]="['/customer/booking', requestId, 'options']">Booking options</a>
    </section>
  `,
})
export class ChooseTechnicianComponent implements OnInit {
  private readonly api = inject(TechnicianService);
  private readonly requests = inject(RequestService);
  private readonly tracking = inject(JobTrackingService);
  private readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly requestId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  readonly request = signal<ServiceRequest | null>(null);
  readonly technicians = signal<TechnicianInfo[]>([]);
  readonly failure = signal('');
  readonly loading = signal(false);
  readonly categoryOnly = signal(true);
  readonly availableOnly = signal(false);
  readonly bestMatch = signal(false);
  readonly sending = signal<string | null>(null);
  readonly sendFailure = signal('');

  constructor() {
    inject(HeaderService).setHeader({ title: 'Choose Technician', showBack: true, backUrl: '/customer/booking/' + this.requestId + '/options', showBell: false });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.requestId;
    if (!id || this.loading()) return;
    this.failure.set('');
    this.loading.set(true);
    this.requests.getById(id).pipe(
      tap(request => this.request.set(request)),
      switchMap(request => forkJoin([
        this.api.list(this.categoryOnly() || this.bestMatch() ? request.categoryId : undefined, {
          available: this.availableOnly(), bestMatch: this.bestMatch(),
        }),
        this.tracking.trackJob(id),
      ])),
      takeUntilDestroyed(this.destroy),
    ).subscribe({
      next: ([people, tracked]) => {
        this.technicians.set(people.filter(person => !tracked.previousTechnicianIds.includes(person.id)));
      },
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not load the technician directory.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  send(tech: TechnicianInfo): void {
    const id = this.requestId;
    if (!id || this.sending() || tech.availability !== 'available' || tech.categoryId !== this.request()?.categoryId) return;
    this.sendFailure.set('');
    this.sending.set(tech.id);
    this.booking.sendOffer(id, tech.id).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => void this.router.navigate(['/customer/booking', id, 'request-sent']),
      error: (error: unknown) => {
        this.sendFailure.set(errorMessage(error, 'Could not send the request. Try again.'));
        this.sending.set(null);
      },
      complete: () => this.sending.set(null),
    });
  }
}
