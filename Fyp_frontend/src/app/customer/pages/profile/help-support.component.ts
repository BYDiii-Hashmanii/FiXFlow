import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-customer-help-support',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="help-page">
      <div class="page-top-nav">
        <a routerLink="/customer/profile" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Back to Profile</span>
        </a>
      </div>

      <div class="help-container">
        <!-- Contact Cards (Screen 27 in PDF) -->
        <div class="contact-section">
          <a href="mailto:support@fixflow.app" class="contact-card card">
            <div class="icon-wrap mail">
              <app-icon name="mail" size="md"></app-icon>
            </div>
            <div class="contact-info">
              <span class="label">Email Support</span>
              <span class="value">support&#64;fixflow.app</span>
            </div>
          </a>

          <a href="tel:+92511234567" class="contact-card card">
            <div class="icon-wrap phone">
              <app-icon name="phone" size="md"></app-icon>
            </div>
            <div class="contact-info">
              <span class="label">Helpline</span>
              <span class="value">+92 51 1234567</span>
            </div>
          </a>
        </div>

        <!-- FAQ Section (Screen 27 in PDF) -->
        <div class="faq-card card">
          <h2 class="faq-header-title">Frequently Asked Questions</h2>

          <div class="faq-item" [class.open]="openFaq === 1">
            <div class="faq-q" (click)="toggleFaq(1)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-header">
                <span class="q-title">How does AI problem diagnosis work?</span>
                <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
              </div>
            </div>
            @if (openFaq === 1) {
              <div class="q-answer">
                When you take or upload a photo and describe your maintenance issue, our AI model analyzes the image to identify the root cause, assign urgency, and generate step-by-step safe repair instructions if it's a minor DIY fix.
              </div>
            }
          </div>

          <div class="faq-item" [class.open]="openFaq === 2">
            <div class="faq-q" (click)="toggleFaq(2)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-header">
                <span class="q-title">How are technicians verified?</span>
                <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
              </div>
            </div>
            @if (openFaq === 2) {
              <div class="q-answer">
                All FixFlow technicians undergo strict background checks, CNIC identity verification, trade license verification, and skill assessments before being approved on the platform.
              </div>
            }
          </div>

          <div class="faq-item" [class.open]="openFaq === 3">
            <div class="faq-q" (click)="toggleFaq(3)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-header">
                <span class="q-title">What happens if a technician declines my request?</span>
                <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
              </div>
            </div>
            @if (openFaq === 3) {
              <div class="q-answer">
                If an auto-matched or chosen technician is unavailable or declines, FixFlow will instantly notify you and recommend alternative top-rated technicians nearby.
              </div>
            }
          </div>

          <div class="faq-item" [class.open]="openFaq === 4">
            <div class="faq-q" (click)="toggleFaq(4)">
              <div class="icon-help">
                <app-icon name="alert-circle" size="sm"></app-icon>
              </div>
              <div class="q-header">
                <span class="q-title">How do payments and invoices work?</span>
                <app-icon name="chevron-right" size="sm" class="chevron"></app-icon>
              </div>
            </div>
            @if (openFaq === 4) {
              <div class="q-answer">
                Technicians generate an itemized invoice upon job completion. You can review parts, labor, and taxes before paying securely via Credit/Debit card, JazzCash, EasyPaisa, or Cash on Delivery.
              </div>
            }
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
      max-width: 640px;
      margin: 0 auto;
      width: 100%;
    }

    .page-top-nav {
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--color-primary);
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .help-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .contact-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;

      @include tablet {
        grid-template-columns: 1fr 1fr;
      }

      .contact-card {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        text-decoration: none;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.mail {
            background-color: #eff6ff;
            color: var(--color-primary);
          }

          &.phone {
            background-color: #dcfce7;
            color: #16a34a;
          }
        }

        .contact-info {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 0.75rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            font-weight: 600;
          }

          .value {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-top: 2px;
          }
        }
      }
    }

    .faq-card {
      padding: 24px;

      .faq-header-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: 20px;
      }

      .faq-item {
        border-bottom: 1px solid #f1f5f9;

        &:last-child {
          border-bottom: none;
        }

        .faq-q {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          cursor: pointer;

          .icon-help {
            color: var(--color-primary);
            flex-shrink: 0;
          }

          .q-header {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .q-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .chevron {
              color: #94a3b8;
              transition: transform var(--transition-fast);
            }
          }
        }

        &.open {
          .chevron {
            transform: rotate(90deg);
          }
        }

        .q-answer {
          padding: 0 0 16px 32px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
      }
    }
  `]
})
export class CustomerHelpSupportComponent implements OnInit {
  private headerService = inject(HeaderService);
  private title = inject(Title);

  openFaq: number | null = 1;

  ngOnInit(): void {
    this.title.setTitle('Help & Support | FixFlow Customer');
    this.headerService.setHeader({ title: 'Help & Support', showBack: true, backUrl: '/customer/profile' });
  }

  toggleFaq(index: number): void {
    this.openFaq = this.openFaq === index ? null : index;
  }
}
