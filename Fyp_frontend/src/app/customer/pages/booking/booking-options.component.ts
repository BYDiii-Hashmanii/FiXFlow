import { ViewportScroller } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ServiceRequest } from '../../models/customer.models';
import { RequestService } from '../../services/request.service';
import { CategoryUnidentifiedComponent } from '../ai/category-unidentified.component';

@Component({
  selector: 'app-booking-options',
  imports: [RouterLink, IconComponent, CategoryUnidentifiedComponent],
  template: `
    <section class="booking-options">
      @if (failure()) {
        <article class="card booking-status">
          <p role="alert">{{ failure() }}</p>
          <button type="button" class="btn btn-secondary" (click)="load()">Try Again</button>
        </article>
      } @else if (request(); as item) {
        @if (item.aiAnalysis?.state === 'pending') {
          <article class="card booking-status">
            <p>Your report is still being analyzed.</p>
            <a class="btn btn-secondary" [routerLink]="['/customer/ai', requestId, 'analysis']">View Analysis Progress</a>
          </article>
        } @else if (item.aiAnalysis?.state === 'needs_category') {
          <article class="card booking-status">
            <p>Confirm the service category to see matching technicians.</p>
            <a class="btn btn-primary" [routerLink]="['/customer/ai', requestId, 'result']">Confirm Service Category</a>
          </article>
        } @else if (item.categoryChoiceRequired) {
          <app-category-unidentified [safetyNote]="item.aiAnalysis?.safetyNote" />
        } @else {
          <header class="card booking-header">
            <span class="option-icon" aria-hidden="true"><app-icon name="wrench" /></span>
            <div>
              <h1>Choose how to book</h1>
              @if (item.title) { <p>{{ item.title }}</p> }
            </div>
            <span class="chip chip-blue">{{ item.category }}</span>
          </header>

          <div class="booking-methods">
            <article class="card booking-method booking-method-auto">
              <span class="option-icon" aria-hidden="true"><app-icon name="star" /></span>
              <div>
                <h2>Auto Select</h2>
                <p>Get a match based on availability, rating, reviews, and price. Review the match before sending a request.</p>
              </div>
              <a class="btn btn-primary" [routerLink]="['/customer/booking', requestId, 'auto-select']">
                Use Auto Select <app-icon name="chevron-right" size="sm" aria-hidden="true" />
              </a>
            </article>
            <article class="card booking-method">
              <span class="option-icon" aria-hidden="true"><app-icon name="user" /></span>
              <div>
                <h2>Choose Technician</h2>
                <p>Browse technicians in your service category. Compare their prices, ratings, and availability before choosing.</p>
              </div>
              <a class="btn btn-secondary" [routerLink]="['/customer/booking', requestId, 'choose']">
                Choose Technician <app-icon name="chevron-right" size="sm" aria-hidden="true" />
              </a>
            </article>
          </div>
        }
      } @else {
        <article class="card booking-status"><p role="status">Loading booking options…</p></article>
      }
    </section>
  `,
  styles: [`
    .booking-options {
      display: grid;
      gap: 1rem;
      width: min(100%, 56rem);
      margin-inline: auto;
    }
    .booking-header, .booking-method, .booking-status { padding: clamp(1rem, 3vw, 1.5rem); }
    .booking-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: .75rem;
    }
    .booking-header > div { flex: 1 1 12rem; min-width: 0; overflow-wrap: anywhere; }
    .booking-header h1 { font-size: clamp(1.2rem, 2vw, 1.55rem); }
    .booking-header p { margin-top: .2rem; }
    .booking-header .chip { max-width: 100%; white-space: normal; overflow-wrap: anywhere; }
    .booking-methods { display: grid; gap: 1rem; }
    .booking-method, .booking-status { display: grid; gap: 1rem; }
    .booking-method { grid-template-rows: auto 1fr auto; }
    .booking-method h2 { margin-bottom: .35rem; font-size: 1.125rem; }
    .booking-method .btn { justify-content: space-between; }
    .booking-method-auto { border-color: var(--color-primary-border); }
    .option-icon {
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      flex-shrink: 0;
      border-radius: var(--radius-md);
      color: var(--color-primary);
      background: var(--color-primary-light);
    }
    @media (min-width: 48rem) {
      .booking-methods { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .booking-status { justify-items: start; }
    }
  `],
})
export class BookingOptionsComponent implements OnInit {
  private readonly requests = inject(RequestService);
  private readonly destroy = inject(DestroyRef);
  readonly requestId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  readonly failure = signal('');
  readonly request = signal<ServiceRequest | null>(null);

  constructor() {
    inject(HeaderService).setHeader({
      title: 'Find a Technician', showBack: true, backUrl: '/customer/requests/' + this.requestId + '/track', showBell: false,
    });
    const viewport = inject(ViewportScroller);
    afterNextRender(() => viewport.scrollToPosition([0, 0]));
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.failure.set('');
    this.requests.getById(this.requestId).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: request => this.request.set(request),
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load the request summary.')),
    });
  }
}
