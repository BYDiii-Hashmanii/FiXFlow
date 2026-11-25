import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IconComponent } from '../shared/components/icon/icon.component';

@Component({
  selector: 'app-portal-select',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="portal-landing">
      <!-- Background Ambient Glow -->
      <div class="bg-glow"></div>

      <div class="landing-container">
        <!-- Brand Header -->
        <header class="landing-header">
          <div class="brand-badge">
            <app-icon name="wrench" size="lg"></app-icon>
          </div>
          <h1 class="brand-title">FixFlow</h1>
          <p class="brand-tagline">Smart Maintenance & Service Management Platform</p>
          <div class="role-pill">Choose Your Portal to Continue</div>
        </header>

        <!-- Two Role Selection Cards -->
        <div class="portal-cards-grid">
          <!-- Customer Card -->
          <div class="portal-card customer-card">
            <div class="card-badge">Customer Portal</div>
            <div class="card-icon-wrap customer-icon">
              <app-icon name="user" size="lg"></app-icon>
            </div>
            <h2 class="card-title">I Need a Repair</h2>
            <p class="card-desc">
              Report maintenance issues, get instant AI repair diagnosis, choose top-rated verified technicians, and pay itemized invoices securely.
            </p>

            <ul class="feature-list">
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Photo upload & instant AI problem diagnosis</span>
              </li>
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Auto-select or choose verified local technicians</span>
              </li>
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Real-time job tracking & status updates</span>
              </li>
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Transparent itemized billing & reviews</span>
              </li>
            </ul>

            <div class="card-actions">
              <a routerLink="/login/customer" class="btn btn-primary btn-block">
                <span>Customer Login</span>
                <app-icon name="chevron-right" size="sm"></app-icon>
              </a>
              <a routerLink="/customer/sign-up" class="btn btn-secondary btn-block">
                <span>Create Customer Account</span>
              </a>
            </div>
          </div>

          <!-- Technician Card -->
          <div class="portal-card technician-card">
            <div class="card-badge tech-badge">Technician Portal</div>
            <div class="card-icon-wrap technician-icon">
              <app-icon name="wrench" size="lg"></app-icon>
            </div>
            <h2 class="card-title">I'm a Technician</h2>
            <p class="card-desc">
              Manage incoming repair requests, accept jobs, update live parts & labor costs, track your daily schedule, and send customer invoices.
            </p>

            <ul class="feature-list">
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Live incoming requests with customer details & photo</span>
              </li>
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Work progress updates, parts list & auto totals</span>
              </li>
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Integrated schedule & upcoming jobs calendar</span>
              </li>
              <li>
                <app-icon name="check" size="sm"></app-icon>
                <span>Generate draft invoices & track earnings</span>
              </li>
            </ul>

            <div class="card-actions">
              <a routerLink="/login/technician" class="btn btn-primary btn-block btn-tech">
                <span>Technician Login</span>
                <app-icon name="chevron-right" size="sm"></app-icon>
              </a>
              <a routerLink="/technician/dashboard" class="btn btn-secondary btn-block">
                <span>Technician Dashboard</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Footer / Environment Switcher -->
        <footer class="landing-footer">
          <p>FixFlow Dual-Role Architecture · Frontend Build Active</p>
          <div class="quick-links">
            <span class="label">Quick Navigation:</span>
            <a routerLink="/customer/home">Customer Home</a>
            <span class="dot">·</span>
            <a routerLink="/technician/dashboard">Technician Dashboard</a>
            <span class="dot">·</span>
            <a routerLink="/customer/report">Report Problem</a>
            <span class="dot">·</span>
            <a routerLink="/technician/jobs">My Jobs</a>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .portal-landing {
      min-height: 100dvh;
      background: linear-gradient(135deg, #f0f7ff 0%, #e0effe 50%, #f8fafc 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      position: relative;
      overflow-x: hidden;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    .bg-glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 300px;
      background: radial-gradient(ellipse, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .landing-container {
      width: 100%;
      max-width: 1040px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 32px;
      position: relative;
      z-index: 1;
    }

    /* Header */
    .landing-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .brand-badge {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background-color: var(--color-primary);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
      }

      .brand-title {
        font-size: clamp(2rem, 4vw, 2.75rem);
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.03em;
        margin-bottom: 6px;
      }

      .brand-tagline {
        font-size: 1rem;
        color: #64748b;
        max-width: 500px;
        margin-bottom: 16px;
      }

      .role-pill {
        display: inline-block;
        padding: 6px 18px;
        border-radius: 9999px;
        background-color: #ffffff;
        color: var(--color-primary);
        font-size: 0.85rem;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #dbeafe;
      }
    }

    /* Cards Grid */
    .portal-cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;

      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .portal-card {
      background-color: #ffffff;
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 45px rgba(37, 99, 235, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05);
        border-color: #bfdbfe;
      }

      .card-badge {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background-color: #eff6ff;
        color: var(--color-primary);

        &.tech-badge {
          background-color: #fef3c7;
          color: #d97706;
        }
      }

      .card-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;

        &.customer-icon {
          background-color: #eff6ff;
          color: var(--color-primary);
        }

        &.technician-icon {
          background-color: #fff7ed;
          color: #ea580c;
        }
      }

      .card-title {
        font-size: 1.45rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
      }

      .card-desc {
        font-size: 0.9rem;
        color: #64748b;
        line-height: 1.5;
        margin-bottom: 24px;
        min-height: 54px;
      }

      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0 0 28px 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;

        li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.85rem;
          color: #334155;

          app-icon {
            color: #16a34a;
            flex-shrink: 0;
            margin-top: 2px;
          }
        }
      }

      .card-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: auto;

        .btn {
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .btn-primary {
          background-color: var(--color-primary);
          color: #ffffff;
          border: none;

          &:hover {
            background-color: var(--color-primary-dark);
          }

          &.btn-tech {
            background-color: #0f172a;

            &:hover {
              background-color: #1e293b;
            }
          }
        }

        .btn-secondary {
          background-color: #f1f5f9;
          color: #1e293b;
          border: 1px solid #cbd5e1;

          &:hover {
            background-color: #e2e8f0;
          }
        }

      }
    }

    /* Footer */
    .landing-footer {
      text-align: center;
      padding-top: 12px;
      color: #64748b;
      font-size: 0.85rem;

      p {
        margin-bottom: 8px;
      }

      .quick-links {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;

        .label {
          font-weight: 600;
          color: #475569;
        }

        a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }

        .dot {
          color: #94a3b8;
        }
      }
    }
  `]
})
export class PortalSelectComponent {
  private router = inject(Router);
  private title = inject(Title);

  constructor() {
    this.title.setTitle('FixFlow | Select Portal (Customer or Technician)');
  }


}
