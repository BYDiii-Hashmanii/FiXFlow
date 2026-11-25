import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HeaderService } from '../../core/services/header.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="not-found-page">
      <div class="not-found-card card">
        <div class="icon-circle">
          <app-icon name="alert-circle" size="lg"></app-icon>
        </div>
        <div class="code-badge">404</div>
        <h1 class="not-found-title">Page Not Found</h1>
        <p class="not-found-desc">
          The screen or resource you are looking for does not exist or has been relocated.
        </p>
        <a routerLink="/technician/dashboard" class="btn btn-primary">
          Return to Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .not-found-card {
      max-width: 440px;
      width: 100%;
      text-align: center;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .code-badge {
        font-size: 3.5rem;
        font-weight: 800;
        color: var(--color-primary);
        line-height: 1;
        margin-bottom: 12px;
      }

      .not-found-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 8px;
      }

      .not-found-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        margin-bottom: 24px;
      }
    }
  `]
})
export class NotFoundComponent implements OnInit {
  private headerService = inject(HeaderService);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('404 Page Not Found | FixFlow');
    this.headerService.setHeader({
      title: 'Not Found',
      showBack: true,
      backUrl: '/technician/dashboard',
      showBell: false
    });
  }
}
