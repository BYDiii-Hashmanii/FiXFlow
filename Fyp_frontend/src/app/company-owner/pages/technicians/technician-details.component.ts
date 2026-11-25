import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TechnicianManagementService } from '../../services/technician-management.service';
import { CompanyJobService } from '../../services/company-job.service';
import { OwnerTechnician, CompanyJob } from '../../models/owner.models';
import { AvailabilityChipComponent } from '../../components/availability-chip/availability-chip.component';
import { JobRowComponent } from '../../components/job-row/job-row.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-owner-technician-details',
  standalone: true,
  imports: [CommonModule, RouterLink, AvailabilityChipComponent, JobRowComponent, IconComponent],
  template: `
    @if (technician()) {
      <div class="page-container">
        <!-- Top header with back button -->
        <div class="page-header">
          <a routerLink="/owner/technicians" class="back-btn" aria-label="Back to technicians">
            <app-icon name="arrow-left" size="md"></app-icon>
          </a>
          <h1 class="page-title">Technician Details</h1>
        </div>
        <div class="content-grid">
          <!-- Profile summary card -->
          <div class="profile-card card">
            <div class="avatar-large">
              {{ technician()!.avatarInitials }}
            </div>
            <h2 class="tech-name">{{ technician()!.name }}</h2>
            <p class="tech-company">{{ technician()!.company }}</p>
            <div class="rating-badge">
              <app-icon name="star" size="sm" class="star-icon"></app-icon>
              <span class="rating-num">{{ technician()!.rating | number: '1.1-1' }}</span>
              <span class="reviews-count">({{ technician()!.reviewCount }} reviews)</span>
            </div>
            <div class="chip-wrap">
              <app-availability-chip
                [availability]="technician()!.availability"
                [label]="technician()!.availabilityNote"
              ></app-availability-chip>
            </div>
          </div>
          <!-- Details list card -->
          <div class="details-card card">
            <h3 class="section-title">Information</h3>
            <div class="detail-row">
              <div class="detail-label">
                <app-icon name="phone" size="sm"></app-icon>
                <span>Phone</span>
              </div>
              <span class="detail-value">{{ technician()!.phone }}</span>
            </div>
            <div class="detail-row">
              <div class="detail-label">
                <app-icon name="wrench" size="sm"></app-icon>
                <span>Category</span>
              </div>
              <span class="detail-value">{{ technician()!.serviceCategory }}</span>
            </div>
            <div class="detail-row">
              <div class="detail-label">
                <app-icon name="tag" size="sm"></app-icon>
                <span>Service Rate</span>
              </div>
              <span class="detail-value">Rs {{ technician()!.serviceRate | number }} / visit</span>
            </div>
            <div class="detail-row">
              <div class="detail-label">
                <app-icon name="check-circle" size="sm"></app-icon>
                <span>Jobs Completed</span>
              </div>
              <span class="detail-value">{{ technician()!.jobsCompleted }}</span>
            </div>
          </div>
          <!-- Assigned / Recent Jobs section -->
          <div class="jobs-section">
            <h3 class="section-title">Assigned Jobs</h3>
            @if (recentJobs().length > 0) {
              <div class="jobs-list">
                @for (job of recentJobs(); track job) {
                  <app-owner-job-row [job]="job"></app-owner-job-row>
                }
              </div>
            } @else {
              <p class="empty-text">No jobs currently assigned to this technician.</p>
            }
          </div>
        </div>
        <!-- Bottom / Inline Actions -->
        <div class="action-footer">
          <a
            [routerLink]="['/owner/technicians', technician()!.id, 'edit']"
            class="btn btn-primary edit-btn"
          >
            <app-icon name="edit" size="sm"></app-icon>
            <span>Edit Details</span>
          </a>
        </div>
      </div>
    } @else {
      <div class="loading-state">
        <p>Loading technician details...</p>
      </div>
    }
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .page-container {
        padding-bottom: 90px;

        @include respond-to(tablet) {
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 32px;
        }

        @include respond-to(desktop) {
          max-width: 1000px;
          margin: 0;
          padding-bottom: 40px;
        }
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          text-decoration: none;
          transition: background-color var(--transition-fast);

          &:hover {
            background-color: #f1f5f9;
          }
        }

        .page-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
      }

      .content-grid {
        display: flex;
        flex-direction: column;
        gap: 20px;

        @include respond-to(desktop) {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;

          .jobs-section {
            grid-column: 1 / -1;
          }
        }
      }

      .profile-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 28px 24px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background-color: #eff6ff;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .tech-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 4px;
        }

        .tech-company {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin: 0 0 14px;
        }

        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #fef3c7;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          margin-bottom: 16px;

          .star-icon {
            color: #f59e0b;
          }

          .rating-num {
            font-weight: 700;
            font-size: 0.9rem;
            color: #92400e;
          }

          .reviews-count {
            font-size: 0.8rem;
            color: #92400e;
          }
        }
      }

      .details-card {
        padding: 24px;
        background-color: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);

        .section-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 18px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--color-border);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;

          &:last-child {
            border-bottom: none;
          }

          .detail-label {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--color-text-secondary);
            font-size: 0.9rem;
          }

          .detail-value {
            font-weight: 600;
            color: var(--color-text-primary);
            font-size: 0.95rem;
          }
        }
      }

      .jobs-section {
        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 14px;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .empty-text {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          background-color: #ffffff;
          padding: 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          text-align: center;
        }
      }

      .action-footer {
        margin-top: 28px;

        @include respond-to(mobile) {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 14px 20px;
          background-color: #ffffff;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
          z-index: 20;

          .edit-btn {
            width: 100%;
            min-height: 48px;
          }
        }

        @include respond-to(tablet) {
          display: flex;
          justify-content: flex-end;
        }

        @include respond-to(desktop) {
          display: flex;
          justify-content: flex-end;

          .edit-btn {
            min-width: 180px;
          }
        }
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        border-radius: var(--radius-md);
        text-decoration: none;
        cursor: pointer;
        transition: background-color var(--transition-fast);

        &.btn-primary {
          background-color: var(--color-primary);
          color: #ffffff;
          padding: 12px 24px;
          border: none;

          &:hover {
            background-color: var(--color-primary-dark);
          }
        }
      }

      .loading-state {
        padding: 40px;
        text-align: center;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class TechnicianDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private techService = inject(TechnicianManagementService);
  private jobService = inject(CompanyJobService);

  technician = signal<OwnerTechnician | null>(null);
  recentJobs = signal<CompanyJob[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTechnician(id);
    }
  }

  private loadTechnician(id: string): void {
    this.techService.getById(id).subscribe({
      next: (tech) => {
        this.technician.set(tech);
        if (tech) {
          this.loadTechnicianJobs(tech.name);
        }
      },
    });
  }

  private loadTechnicianJobs(techName: string): void {
    this.jobService.list().subscribe({
      next: (jobs) => {
        const filtered = jobs.filter(
          (j) => j.technicianName.toLowerCase() === techName.toLowerCase(),
        );
        this.recentJobs.set(filtered);
      },
    });
  }
}
