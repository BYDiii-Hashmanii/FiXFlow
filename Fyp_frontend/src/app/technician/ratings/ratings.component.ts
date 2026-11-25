import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../core/services/data.service';
import { HeaderService } from '../../core/services/header.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="ratings-page">
      <!-- Desktop Back Navigation -->
      <div class="page-top-nav">
        <a routerLink="/technician/profile" class="back-link">
          <app-icon name="arrow-left" size="sm"></app-icon>
          <span>Back to Profile</span>
        </a>
      </div>

      <div class="ratings-layout">
        <!-- Rating Overview Card (Matches Screen 20 in PDF) -->
        <div class="overview-card card">
          <div class="score-box">
            <span class="big-score">{{ dataService.technician()?.rating ?? 'N/A' }}</span>
            <div class="stars-row">
              @for (star of [1,2,3,4,5]; track star) {
                <app-icon name="star" size="md"></app-icon>
              }
            </div>
            <span class="reviews-count">Based on {{ dataService.technician()?.totalReviews }} customer reviews</span>
          </div>

          <!-- Breakdown bars -->
          <div class="breakdown-bars">
            @for (stars of [5, 4, 3, 2, 1]; track stars) {
              <div class="bar-line">
                <span class="star-num">{{ stars }} star</span>
                <div class="progress-track" aria-hidden="true"><div class="fill" [style.width.%]="percent(stars)"></div></div>
                <span class="percentage">{{ percent(stars) }}%</span>
              </div>
            }
          </div>
        </div>

        <!-- Customer Feedback Feed (Matches Screen 20 in PDF) -->
        <div class="feedback-feed">
          <h2 class="feed-title">Recent Customer Reviews</h2>

          <div class="feed-list">
            @for (feedback of dataService.feedbacks(); track feedback.id) {
              <div class="review-card card">
                <div class="review-top">
                  <div class="reviewer-info">
                    <div class="reviewer-avatar">{{ feedback.customerInitials }}</div>
                    <div>
                      <h4 class="reviewer-name">{{ feedback.customerName }}</h4>
                      <span class="review-job">{{ feedback.jobTitle }} · {{ feedback.date }}</span>
                    </div>
                  </div>
                  <div class="stars-pill">
                    @for (s of [1,2,3,4,5]; track s) {
                      <app-icon name="star" size="sm"></app-icon>
                    }
                  </div>
                </div>

                <p class="review-text">"{{ feedback.comment }}"</p>
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

    .ratings-page {
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

    .ratings-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;

      @include desktop {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 24px;
        align-items: start;
      }
    }

    /* Rating Overview Card */
    .overview-card {
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      .score-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .big-score {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .stars-row {
          display: flex;
          gap: 4px;
          color: #f59e0b;
          margin: 10px 0;
        }

        .reviews-count {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
      }

      .breakdown-bars {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .bar-line {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.825rem;

          .star-num {
            width: 44px;
            color: var(--color-text-secondary);
          }

          .progress-track {
            flex: 1;
            height: 6px;
            background-color: #f1f5f9;
            border-radius: var(--radius-full);
            overflow: hidden;

            .fill {
              height: 100%;
              background-color: #f59e0b;
              border-radius: var(--radius-full);
            }
          }

          .percentage {
            width: 32px;
            text-align: right;
            color: var(--color-text-muted);
          }
        }
      }
    }

    /* Customer Feedback Feed */
    .feedback-feed {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .feed-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--color-text-primary);
      }

      .feed-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .review-card {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;

          .review-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            .reviewer-info {
              display: flex;
              align-items: center;
              gap: 12px;

              .reviewer-avatar {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-full);
                background-color: #dbeafe;
                color: #1e40af;
                font-weight: 700;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .reviewer-name {
                font-size: 0.95rem;
                font-weight: 600;
                color: var(--color-text-primary);
              }

              .review-job {
                font-size: 0.775rem;
                color: var(--color-text-muted);
              }
            }

            .stars-pill {
              display: flex;
              gap: 2px;
              color: #f59e0b;
            }
          }

          .review-text {
            font-size: 0.925rem;
            line-height: 1.55;
            color: var(--color-text-primary);
            font-style: italic;
          }
        }
      }
    }
  `]
})
export class RatingsComponent implements OnInit {
  dataService = inject(DataService);
  private headerService = inject(HeaderService);
  private title = inject(Title);

  percent(stars: number): number {
    const reviews = this.dataService.feedbacks();
    return reviews.length ? Math.round(reviews.filter(item => item.rating === stars).length * 100 / reviews.length) : 0;
  }

  ngOnInit(): void {
    this.title.setTitle('Ratings & Feedback | FixFlow Technician');
    this.headerService.setHeader({
      title: 'Feedback',
      showBack: true,
      backUrl: '/technician/profile',
      showBell: true
    });
  }
}
