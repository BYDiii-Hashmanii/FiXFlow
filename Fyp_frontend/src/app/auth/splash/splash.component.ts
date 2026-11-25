import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="splash-screen">
      <div class="splash-content">
        <div class="logo-box">
          <app-icon name="wrench" size="xl" class="logo-icon"></app-icon>
        </div>
        <h1 class="brand-title">FixFlow</h1>
        <p class="brand-tagline">Smart Maintenance Management</p>

        <div class="loader-line">
          <div class="loader-progress"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .splash-screen {
      position: fixed;
      inset: 0;
      background-color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      color: #ffffff;
      animation: fadeIn 0.4s ease-out;
    }

    .logo-box {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-xl);
      background-color: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.25);

      .logo-icon {
        color: #ffffff;
      }
    }

    .brand-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 6px;
      color: #ffffff;
    }

    .brand-tagline {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 32px;
      font-weight: 500;
    }

    .loader-line {
      width: 140px;
      height: 4px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-full);
      overflow: hidden;

      .loader-progress {
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        border-radius: var(--radius-full);
        animation: progressAnim 1.4s ease-in-out infinite;
        transform-origin: 0% 50%;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes progressAnim {
      0% {
        transform: scaleX(0);
      }
      50% {
        transform: scaleX(0.7);
      }
      100% {
        transform: scaleX(1);
      }
    }
  `]
})
export class SplashComponent implements OnInit {
  private router = inject(Router);
  private authState = inject(AuthStateService);

  ngOnInit(): void {
    setTimeout(() => {
      if (this.authState.isLoggedIn()) {
        const role = this.authState.role();
        if (role) {
          this.router.navigate([this.authState.getHomeRoute(role)]);
          return;
        }
      }
      this.router.navigate(['/roles']);
    }, 1500);
  }
}
