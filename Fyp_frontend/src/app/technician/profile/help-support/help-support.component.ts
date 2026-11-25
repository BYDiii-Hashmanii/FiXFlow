import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="help-page">
      <div class="page-top-nav">
        <a routerLink="/technician/profile" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Back to Profile</span>
        </a>
      </div>

      <div class="help-container">
        <!-- Contact Cards (matches Screen 27 in PDF) -->
        <div class="contact-section">
          <a href="mailto:support@fixflow.app" class="contact-card card">
            <div class="icon-wrap mail">
              <app-icon name="mail" size="md"></app-icon>
            </div>
            <div class="contact-info">
              <span class="label">Email</span>
              <span class="value">support&#64;fixflow.app</span>
            </div>
          </a>

          <a href="tel:+92511234567" class="contact-card card">
            <div class="icon-wrap phone">
              <app-icon name="phone" size="md"></app-icon>
            </div>
            <div class="contact-info">
              <span class="label">Contact number</span>
              <span class="value">+92 51 1234567</span>
            </div>
          </a>
        </div>

        <!-- FAQ Section (matches Screen 27 in PDF) -->
        <div class="faq-card card">
          <h2 class="faq-header-title">Frequently Asked Questions</h2>

          <div class="faq-item">
            <div class="faq-q" (click)="toggleFaq(1)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-text">
                <span class="q-title">How do I receive payments?</span>
                @if (openFaq === 1) {
                  <p class="q-answer">
                    Payments are credited directly upon customer invoice approval and settlement. Your earnings accumulate in your weekly payout balance and transfer every Wednesday to your linked bank account.
                  </p>
                }
              </div>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-q" (click)="toggleFaq(2)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-text">
                <span class="q-title">What if replacement parts cost more than estimated?</span>
                @if (openFaq === 2) {
                  <p class="q-answer">
                    You can update the parts list and prices directly on the "Update Work" screen before generating the invoice. The customer will review the itemized breakdown before making payment.
                  </p>
                }
              </div>
            </div>
          </div>

          <div class="faq-item">
            <div class="faq-q" (click)="toggleFaq(3)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-text">
                <span class="q-title">How do I change my service categories?</span>
                @if (openFaq === 3) {
                  <p class="q-answer">
                    To expand your verified trades (e.g. Electrical, HVAC, Plumbing), contact your company administrator or FixFlow technician support with your trade certifications.
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .help-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-top-nav {
      display: flex;
      align-items: center;

      @include mobile {
        display: none;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-text-secondary);

        &:hover {
          color: var(--color-primary);
          text-decoration: none;
        }
      }
    }

    .help-container {
      max-width: 620px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Contact Section (Matches Screen 27 in PDF) */
    .contact-section {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .contact-card {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        text-decoration: none;
        transition: transform var(--transition-fast), border-color var(--transition-fast);

        &:hover {
          border-color: var(--color-primary);
        }

        .icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;

          &.mail {
            background-color: #eff6ff;
            color: #2563eb;
          }

          &.phone {
            background-color: #f0fdf4;
            color: #16a34a;
          }
        }

        .contact-info {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 0.8rem;
            color: var(--color-text-muted);
            font-weight: 500;
          }

          .value {
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-text-primary);
          }
        }
      }
    }

    /* FAQ Section (Matches Screen 27 in PDF) */
    .faq-card {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .faq-header-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text-primary);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--color-border-subtle);
      }

      .faq-item {
        border-bottom: 1px solid var(--color-border-subtle);
        padding-bottom: 14px;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .faq-q {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;

          .icon-help {
            width: 32px;
            height: 32px;
            border-radius: var(--radius-sm);
            background-color: #f1f5f9;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .q-text {
            flex: 1;

            .q-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--color-text-primary);
              display: block;
            }

            .q-answer {
              font-size: 0.875rem;
              line-height: 1.55;
              color: var(--color-text-secondary);
              margin-top: 8px;
              animation: fadeIn 0.2s ease-out;
            }
          }
        }
      }
    }
  `]
})
export class HelpSupportComponent implements OnInit {
  private headerService = inject(HeaderService);
  private title = inject(Title);

  openFaq: number = 1;

  ngOnInit(): void {
    this.title.setTitle('Help & Support | FixFlow Technician');
    this.headerService.setHeader({
      title: 'Help and Support',
      showBack: true,
      backUrl: '/technician/profile',
      showBell: true
    });
  }

  toggleFaq(id: number): void {
    this.openFaq = this.openFaq === id ? 0 : id;
  }
}
