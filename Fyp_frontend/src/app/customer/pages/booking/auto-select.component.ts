import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { EMPTY, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { RequestService } from '../../services/request.service';
import { TechnicianService } from '../../services/technician.service';

@Component({
  selector: 'app-auto-select',
  imports: [RouterLink],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Auto Select</h1>
      @if (loading()) {
        <div class="flow-center" role="status">
          <div class="flow-spinner" aria-hidden="true"></div>
          <strong>Finding the best technician for your problem…</strong>
          <ul class="flow-list">
            <li><span aria-hidden="true">{{ category() ? '✓' : '○' }}</span> Service category{{ category() ? ' · ' + category() : '' }}</li>
            <li><span aria-hidden="true">○</span> Availability</li>
            <li><span aria-hidden="true">○</span> Price</li>
            <li><span aria-hidden="true">○</span> Rating</li>
            <li><span aria-hidden="true">○</span> Reviews</li>
          </ul>
        </div>
      }
      @if (failure()) {
        <p class="flow-warning" role="alert">{{ failure() }}</p>
        <div class="flow-actions">
          <button class="btn btn-primary" (click)="find()">Try Again</button>
          <a class="btn btn-secondary" [routerLink]="['/customer/booking', id, 'choose']">Choose Technician</a>
        </div>
      }
    </section>
  `,
})
export class AutoSelectComponent implements OnInit {
  private readonly api = inject(TechnicianService);
  private readonly requests = inject(RequestService);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  readonly category = signal('');
  readonly loading = signal(false);
  readonly failure = signal('');

  constructor() {
    inject(HeaderService).setHeader({ title: 'Auto Select', showBack: true, backUrl: '/customer/booking/' + this.id + '/options', showBell: false });
  }

  ngOnInit(): void { this.find(); }

  find(): void {
    if (!this.id || this.loading()) return;
    this.failure.set('');
    this.loading.set(true);
    this.requests.getById(this.id).pipe(
      tap(request => this.category.set(request.category)),
      switchMap(request => {
        if (request.categoryChoiceRequired || request.aiAnalysis?.state === 'pending') {
          void this.router.navigate(['/customer/booking', this.id, 'options'], { replaceUrl: true });
          return EMPTY;
        }
        return this.api.autoSelect(this.id);
      }),
      takeUntilDestroyed(this.destroy),
    ).subscribe({
      next: tech => void this.router.navigate(['/customer/booking', this.id, 'selected', tech.id], { queryParams: { mode: 'auto' } }),
      error: (error: unknown) => {
        this.failure.set(errorMessage(error, 'No available technician was found.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
