import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-splash',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="splash-screen" (click)="proceed()">
      <div class="splash-content">
        <div class="logo-box animate-pulse">
          <app-icon name="wrench" size="lg"></app-icon>
        </div>
        <h1 class="brand-title">FixFlow</h1>
        <p class="brand-subtitle">Smart Maintenance Management</p>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash-screen {
      position: fixed;
      inset: 0;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 100;
      user-select: none;
    }

    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
    }

    .logo-box {
      width: 76px;
      height: 76px;
      border-radius: 20px;
      background-color: var(--color-primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .brand-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }

    .brand-subtitle {
      font-size: 0.95rem;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 32px;
    }

    .loading-bar {
      width: 140px;
      height: 4px;
      background-color: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;

      .loading-progress {
        width: 100%;
        height: 100%;
        background-color: var(--color-primary);
        animation: progressAnim 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    }

    @keyframes progressAnim {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(0%); }
    }
  `]
})
export class CustomerSplashComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private title = inject(Title);
  private timerId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.title.setTitle('FixFlow | Customer Portal');
    this.timerId = setTimeout(() => {
      this.proceed();
    }, 2000);
  }

  proceed(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.router.navigate(['/customer/login']);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
