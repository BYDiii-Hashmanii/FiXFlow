import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { forkJoin } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { TechnicianInfo } from '../../models/customer.models';
import { BookingService } from '../../services/booking.service';
import { RequestService } from '../../services/request.service';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-selected-technician',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Selected Technician</h1>
      @if (failure()) { <p role="alert">{{ failure() }}</p> }
      @if (selected(); as tech) {
        <article class="card flow-card flow-stack">
          <div class="flow-person"><span class="flow-avatar">{{ tech.avatarInitials }}</span><div>
            <strong>{{ tech.name }}</strong>
            <p class="flow-muted">{{ tech.company }}</p>
            <p>★ {{ tech.rating ?? 'N/A' }} ({{ tech.reviewCount }} reviews)</p>
          </div></div>
          <dl>
            <dt>Service</dt><dd>{{ tech.serviceCategory }}</dd>
            <dt>Price</dt><dd>Rs {{ tech.rate | number }} / visit</dd>
            <dt>Availability</dt><dd><span class="flow-badge flow-success">Available now</span></dd>
          </dl>
        </article>
        @if (autoSelected) {
          <aside class="flow-note">
            <h2>Why this technician?</h2>
            <p>FixFlow ranks available technicians in {{ tech.serviceCategory }} by rating, more reviews, lower price, then technician ID. Your request is assigned once the technician accepts.</p>
          </aside>
        }
      } @else if (!failure()) {
        <p role="status">Loading technician…</p>
      }
      <div class="flow-actions">
        @if (selected()) { <button class="btn btn-primary" [disabled]="pending()" (click)="send()">Send Request</button> }
        <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'choose']">Choose Someone Else</a>
      </div>
    </section>
  `,
})
export class SelectedTechnicianComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly directory = inject(TechnicianService);
  private readonly booking = inject(BookingService);
  private readonly requests = inject(RequestService);
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly autoSelected = this.route.snapshot.queryParamMap.get('mode') === 'auto';
  readonly selected = signal<TechnicianInfo | null>(null);
  readonly pending = signal(false);
  readonly failure = signal('');

  constructor() {
    inject(HeaderService).setHeader({ title: 'Selected Technician', showBack: true, backUrl: '/customer/booking/' + this.id + '/options', showBell: false });
  }

  ngOnInit(): void {
    const techId = this.route.snapshot.paramMap.get('techId');
    if (!this.id || !techId) return;
    forkJoin([this.requests.getById(this.id), this.directory.getById(techId)]).subscribe({
      next: ([request, tech]) => {
        if (request.categoryId !== tech.categoryId || tech.availability !== 'available') {
          this.failure.set('This technician is unavailable for the request.');
        } else {
          this.selected.set(tech);
        }
      },
      error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load this selection.')),
    });
  }

  send(): void {
    const tech = this.selected();
    if (!this.id || !tech || this.pending()) return;
    this.failure.set('');
    this.pending.set(true);
    this.booking.sendOffer(this.id, tech.id).subscribe({
      next: () => void this.router.navigate(['/customer/booking', this.id, 'request-sent']),
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'Could not send the request. Try again.'));
        this.pending.set(false);
      },
      complete: () => this.pending.set(false),
    });
  }
}
