import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-owner-help-support',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="help-page">
      <div class="page-top-nav">
        <a routerLink="/owner/profile" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Profile</span>
        </a>
      </div>

      <div class="content-container">
        <div class="header-section">
          <h1 class="page-title">Help & Support</h1>
          <p class="page-subtitle">
            Get in touch with FixFlow platform support or read common guides
          </p>
        </div>

        <!-- Contact Channels -->
        <div class="contact-grid">
          <a href="mailto:support@fixflow.app" class="contact-card card">
            <div class="icon-wrap">
              <app-icon name="mail" size="md"></app-icon>
            </div>
            <div class="contact-meta">
              <span class="label">Email Support</span>
              <span class="value">support@fixflow.app</span>
              <span class="sub">Replies typically within 24 hours</span>
            </div>
          </a>

          <a href="tel:+92511234567" class="contact-card card">
            <div class="icon-wrap phone-wrap">
              <app-icon name="phone" size="md"></app-icon>
            </div>
            <div class="contact-meta">
              <span class="label">Phone Helpline</span>
              <span class="value">+92 51 1234567</span>
              <span class="sub">Monday to Saturday, 9am - 6pm</span>
            </div>
          </a>
        </div>

        <!-- FAQ Section -->
        <div class="faq-section">
          <h2 class="faq-title">Frequently Asked Questions</h2>
          <div class="faq-list">
            @for (faq of faqs; track faq; let i = $index) {
              <div class="faq-card card" [class.open]="faq.open" (click)="toggleFaq(i)">
                <div class="faq-question-row">
                  <span class="question-text">{{ faq.question }}</span>
                  <app-icon
                    [name]="faq.open ? 'chevron-up' : 'chevron-down'"
                    size="sm"
                    class="chevron-icon"
                  ></app-icon>
                </div>
                @if (faq.open) {
                  <div class="faq-answer-row">
                    <p class="answer-text">{{ faq.answer }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @use 'styles/variables' as *;
      @use 'styles/mixins' as *;

      .help-page {
        padding-bottom: 40px;
      }

      .page-top-nav {
        margin-bottom: 20px;

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;

          &:hover {
            color: var(--color-primary);
          }
        }
      }

      .content-container {
        max-width: 680px;
        margin: 0 auto;

        @include respond-to(desktop) {
          margin: 0;
        }
      }

      .header-section {
        margin-bottom: 24px;

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 4px;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin: 0;
        }
      }

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 32px;

        @include respond-to(tablet) {
          grid-template-columns: 1fr 1fr;
        }

        .contact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: inherit;
          transition:
            border-color var(--transition-fast),
            background-color var(--transition-fast);

          &:hover {
            background-color: #f8fafc;
            border-color: #cbd5e1;
          }

          .icon-wrap {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-full);
            background-color: #eff6ff;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            &.phone-wrap {
              background-color: #ecfdf5;
              color: #059669;
            }
          }

          .contact-meta {
            display: flex;
            flex-direction: column;

            .label {
              font-size: 0.8rem;
              color: var(--color-text-secondary);
              text-transform: uppercase;
              font-weight: 600;
            }

            .value {
              font-size: 1rem;
              font-weight: 700;
              color: var(--color-text-primary);
              margin: 2px 0;
            }

            .sub {
              font-size: 0.75rem;
              color: var(--color-text-secondary);
            }
          }
        }
      }

      .faq-section {
        .faq-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 16px;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-card {
          background-color: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          cursor: pointer;
          transition: border-color var(--transition-fast);

          &:hover {
            border-color: #cbd5e1;
          }

          .faq-question-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;

            .question-text {
              font-weight: 600;
              font-size: 0.95rem;
              color: var(--color-text-primary);
            }

            .chevron-icon {
              color: #94a3b8;
              flex-shrink: 0;
            }
          }

          .faq-answer-row {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #f1f5f9;

            .answer-text {
              font-size: 0.9rem;
              color: var(--color-text-secondary);
              line-height: 1.5;
              margin: 0;
            }
          }
        }
      }
    `,
  ],
})
export class HelpSupportComponent {
  faqs: FaqItem[] = [
    {
      question: 'How do I add a new technician?',
      answer:
        'Go to the Technicians tab in the navigation bar or dashboard, click "Add Technician", enter their full name, Pakistani phone number, service category, and hourly rate, then submit the form.',
      open: true,
    },
    {
      question: 'Can I change a technician availability status?',
      answer:
        'Yes. Open the technician details page, click "Edit Details", and choose between Available, Busy, or Unavailable status.',
      open: false,
    },
    {
      question: 'How are invoices sent to customers?',
      answer:
        'Invoices are created and submitted by your technicians directly after completing their job inspection and service. You can review all invoices and payment statuses in the Invoice Records section.',
      open: false,
    },
    {
      question: 'How does customer feedback work?',
      answer:
        'Once a service request is marked completed and paid, the customer is prompted to rate the service from 1 to 5 stars and leave a comment. You can view all reviews under Customer Feedback.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
