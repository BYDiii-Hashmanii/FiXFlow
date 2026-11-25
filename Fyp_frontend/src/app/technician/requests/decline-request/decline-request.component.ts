import { JobRequest } from '../../../core/models/request.model';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/services/data.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-decline-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <div class="decline-page-container">
      <div class="decline-card card">
        <div class="card-header-icon">
          <app-icon name="alert-circle" size="lg"></app-icon>
        </div>
        <h2 class="decline-title">Decline Request</h2>
        <p class="decline-desc">
          Please select a reason why you cannot accept the request for
          <strong>{{ requestTitle }}</strong>.
        </p>

        <form [formGroup]="declineForm" (ngSubmit)="onSubmit()" class="decline-form">
          <div class="reasons-list">
            @for (reason of reasons; track reason) {
              <label class="reason-radio-label" [class.selected]="declineForm.get('reason')?.value === reason">
                <input
                  type="radio"
                  formControlName="reason"
                  [value]="reason"
                  class="radio-input"
                />
                <span class="reason-text">{{ reason }}</span>
              </label>
            }
          </div>


          <div class="decline-actions">
            <a [routerLink]="['/technician/requests', requestId]" class="btn btn-secondary flex-1">
              Cancel
            </a>
            <button
              type="submit"
              class="btn btn-danger flex-1"
              [disabled]="declineForm.invalid || dataService.pending() || !request"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .decline-page-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(80vh - #{$topbar-height});
      padding: 16px;
    }

    .decline-card {
      width: 100%;
      max-width: $form-max-width;
      padding: 28px 24px;
      text-align: center;

      @include mobile {
        padding: 20px 16px;
      }

      .card-header-icon {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-full);
        background-color: #fee2e2;
        color: #dc2626;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .decline-title {
        font-size: 1.4rem;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .decline-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 24px;
      }
    }

    .decline-form {
      text-align: left;

      .reasons-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;

        .reason-radio-label {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: #ffffff;
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            border-color: #cbd5e1;
            background-color: #f8fafc;
          }

          &.selected {
            border-color: #dc2626;
            background-color: #fef2f2;
          }

          .radio-input {
            width: 18px;
            height: 18px;
            accent-color: #dc2626;
          }

          .reason-text {
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--color-text-primary);
          }
        }
      }

      .note-group {
        margin-bottom: 24px;
      }

      .decline-actions {
        display: flex;
        gap: 12px;

        .flex-1 {
          flex: 1;
        }
      }
    }
  `]
})
export class DeclineRequestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  requestId = '';
  request?: JobRequest;
  requestTitle = 'Incoming Job';

  reasons: string[] = [
    'Busy with current job',
    'Not Available at requested time',
    'Outside Service Area',
    'Other'
  ];

  declineForm: FormGroup = this.fb.group({
    reason: ['Busy with current job', Validators.required]
  });

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.requestId) this.dataService.read(this.dataService.getRequestById(this.requestId), request => {
      this.request = request;
      this.requestTitle = request.title;
    });

    this.title.setTitle('Decline Request | FixFlow');
    this.headerService.setHeader({
      title: 'Decline Request',
      showBack: true,
      backUrl: `/technician/requests/${this.requestId}`,
      showBell: false
    });
  }

  onSubmit(): void {
    const request = this.request;
    if (!this.declineForm.valid || !request) return;
    const { reason } = this.declineForm.value;
    this.dataService.run(() => this.dataService.declineRequest(request, reason), () => {
      void this.router.navigate(['/technician/requests', request.id, 'declined']);
    });
  }
}
