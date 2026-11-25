import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-request-declined',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="result-page-container">
      <div class="result-card card">
        <div class="status-circle warning">
          <app-icon name="alert-circle" size="lg"></app-icon>
        </div>

        <h1 class="result-title">Request Declined</h1>
        <p class="result-desc">
          You have declined this job request. Your profile remains active and visible to receive other incoming requests in your service area.
        </p>

        <div class="btn-group">
          <a routerLink="/technician/dashboard" class="btn btn-primary btn-block">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .result-page-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(80vh - #{$topbar-height});
      padding: 16px;
    }

    .result-card {
      width: 100%;
      max-width: 460px;
      padding: 40px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .status-circle {
        width: 72px;
        height: 72px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;

        &.warning {
          background-color: #fef3c7;
          color: #d97706;
        }
      }

      .result-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 12px;
      }

      .result-desc {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
        margin-bottom: 32px;
      }

      .btn-group {
        width: 100%;
      }
    }
  `]
})
export class RequestDeclinedComponent implements OnInit {
  private headerService = inject(HeaderService);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Request Declined | FixFlow');
    this.headerService.setHeader({
      title: 'Request Declined',
      showBack: false,
      showBell: true
    });
  }
}
