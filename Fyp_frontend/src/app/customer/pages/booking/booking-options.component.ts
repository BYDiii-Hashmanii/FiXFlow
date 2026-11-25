import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { RequestService } from '../../services/request.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-booking-options',
  imports: [RouterLink],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Find a Technician</h1>
      <p class="flow-muted">Choose how to book a technician@if (request()?.title; as title) { for {{ title }}}.</p>
      @if (failure()) { <p class="flow-warning" role="alert">{{ failure() }}</p> }
      <article class="card flow-card">
        <h2>Auto Select</h2>
        <p>Find the best available match for your service category.</p>
        <ul><li>Compare rating, reviews and price</li><li>Review the match before sending your request</li></ul>
      </article>
      <article class="card flow-card">
        <h2>Choose Technician</h2>
        <p>Compare technicians from different companies and pick one yourself.</p>
        <ul><li>Compare price, rating and availability</li></ul>
      </article>
      <div class="flow-actions">
        <a class="btn btn-primary" [routerLink]="['/customer/booking', requestId, 'auto-select']">Use Auto Select</a>
        <a class="btn btn-secondary" [routerLink]="['/customer/booking', requestId, 'choose']">Choose Technician</a>
      </div>
    </section>
  `,
})
export class BookingOptionsComponent {
  readonly requestId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  constructor() {
    inject(HeaderService).setHeader({ title: 'Find a Technician', showBack: true, backUrl: '/customer/requests/' + this.requestId + '/track', showBell: false });
  }

  readonly failure = signal('');
  readonly request = toSignal(inject(RequestService).getById(this.requestId).pipe(catchError(() => {
    this.failure.set('Could not load the request summary.');
    return of(null);
  })));
}
