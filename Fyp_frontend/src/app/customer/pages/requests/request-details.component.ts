import { ProtectedPhotoComponent } from '../../../shared/components/protected-photo.component';
import { errorMessage } from '../../../core/interceptors/error.interceptor';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RequestService } from '../../services/request.service';
import { HeaderService } from '../../../core/services/header.service';
import { ServiceRequest } from '../../models/customer.models';


@Component({
  selector: 'app-customer-request-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ProtectedPhotoComponent],
  template: `
    @if (failure) { <p role="alert">{{ failure }}</p> }
    @if (request) {
      <div class="request-details-page">
        <div class="details-container">
          <!-- Photo Display Box (Matches Screen 22 in PDF) -->
          @if (request.photoUrl) {
            <div class="photo-display card"><app-protected-photo [path]="request.photoUrl" label="Request photo"></app-protected-photo></div>
          }

          <!-- Problem summary details (Screen 22) -->
          <div class="details-card card">
            <div class="card-header-top">
              <h2 class="problem-heading">{{ request.title ?? request.category }}</h2>
              <span class="chip chip-blue" role="status">{{ request.status.replaceAll('_', ' ') | titlecase }}</span>
            </div>

            <div class="specs-list">
              <div class="spec-row">
                <span class="lbl">Category</span>
                <span class="val font-semibold">{{ request.category }}</span>
              </div>
              <div class="spec-row">
                <span class="lbl">Urgency</span>
                <span class="val">{{ request.urgency ?? 'N/A' }}</span>
              </div>
              <div class="spec-row">
                <span class="lbl">Access time</span>
                <span class="val font-semibold">{{ request.accessTime }}</span>
              </div>
              <div class="spec-row">
                <span class="lbl">Technician</span>
                <span class="val font-semibold">{{ request.assignedTechnician?.name ?? 'N/A' }}</span>
              </div>
              <div class="spec-row">
                <span class="lbl">Company</span>
                <span class="val">{{ request.assignedTechnician?.company ?? 'N/A' }}</span>
              </div>
              <div class="spec-row">
                <span class="lbl">Price</span>
                <span class="val font-semibold">{{ (request.estimatedPrice === null || request.estimatedPrice === undefined) ? 'N/A' : ('Rs ' + (request.estimatedPrice | number) + ' / visit') }}</span>
              </div>
            </div>

            <p class="issue-description">{{ request.description }}</p>
          </div>

          <!-- Action Button: Track Job (Screen 22) -->
          <a [routerLink]="['/customer/requests', request.id, 'track']" class="btn btn-primary btn-block btn-track">
            Track Job
          </a>
        </div>
      </div>
    }
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .request-details-page {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .details-container {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .photo-display {
      padding: 0;
      overflow: hidden;
      height: 260px;
      background-color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;

      .mock-sink-photo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .mock-svg {
          width: 110px;
          height: 110px;
        }

        .preview-text {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
      }
    }

    .details-card {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;

      .card-header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .problem-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
      }

      .specs-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--color-border-subtle);

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .lbl {
            color: var(--color-text-muted);
          }

          .val {
            color: var(--color-text-primary);

            &.font-semibold {
              font-weight: 600;
            }
          }
        }
      }

      .issue-description {
        font-size: 0.925rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        padding-top: 10px;
        border-top: 1px solid var(--color-border-subtle);
      }
    }

    .btn-track {
      height: 48px;
      font-size: 1rem;
    }
  `]
})
export class CustomerRequestDetailsComponent implements OnInit {
  private requestService = inject(RequestService);
  private headerService = inject(HeaderService);
  private route = inject(ActivatedRoute);
  private title = inject(Title);

  request?: ServiceRequest;

  failure = "";

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.title.setTitle(`Request #${id} Details | FixFlow`);
    this.headerService.setHeader({
      title: 'Request Details',
      showBack: true,
      backUrl: '/customer/requests',
      showBell: false
    });

    this.requestService.getById(id).subscribe({ next: req => { this.request = req; },
      error: (error: unknown) => { this.failure = errorMessage(error, 'Could not load this request.'); }, });
  }
}
