import { Component, OnInit, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TechnicianManagementService } from '../../services/technician-management.service';
import { HeaderService } from '../../../core/services/header.service';
import { OwnerTechnician } from '../../models/owner.models';
import { OwnerTechnicianCardComponent } from '../../components/technician-card/technician-card.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-owner-technician-list',
  standalone: true,
  imports: [RouterLink, OwnerTechnicianCardComponent, LoaderComponent, EmptyStateComponent],
  template: `
    <div class="tech-list-page">
      <div class="page-header-row">
        <div>
          <h2 class="page-title">Technicians</h2>
          <p class="page-subtitle">Only Rayyan Repair Services technicians</p>
        </div>
        <div class="desktop-header-action">
          <a routerLink="/owner/technicians/add" class="btn btn-primary btn-sm"> Add Technician </a>
        </div>
      </div>

      @if (loading()) {
        <app-loader></app-loader>
      } @else if (technicians().length === 0) {
        <app-empty-state
          title="No technicians found"
          message="You have not added any technicians yet."
        ></app-empty-state>
      } @else {
        <!-- Responsive 3-Column Card Grid on Desktop (Matches Screen 3 in PDF) -->
        <div class="tech-grid">
          @for (tech of technicians(); track tech.id) {
            <app-owner-technician-card [technician]="tech"></app-owner-technician-card>
          }
        </div>
      }

      <!-- Mobile Bottom Button -->
      <div class="mobile-action-bar">
        <a routerLink="/owner/technicians/add" class="btn btn-primary btn-block">
          Add Technician
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .tech-list-page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      }

      .page-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .page-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .page-subtitle {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin: 4px 0 0 0;
        }

        .desktop-header-action {
          display: none;

          @include desktop {
            display: block;
          }
        }
      }

      /* 3 Columns on Desktop */
      .tech-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;

        @include tablet {
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @include desktop {
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
      }

      .mobile-action-bar {
        margin-top: 12px;

        @include desktop {
          display: none;
        }

        .btn {
          height: 48px;
          font-weight: 600;
        }
      }
    `,
  ],
})
export class OwnerTechnicianListComponent implements OnInit {
  private techService = inject(TechnicianManagementService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  loading = signal<boolean>(true);
  technicians = signal<OwnerTechnician[]>([]);

  ngOnInit(): void {
    this.title.setTitle('Technicians | FixFlow Company Owner');
    this.headerService.setHeader({ title: 'Technicians', showBack: false });

    this.techService.list().subscribe({
      next: (items) => {
        this.technicians.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
