import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-problem-solved',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="problem-solved-page">
      <div class="solved-card card">
        <div class="status-circle success">
          <app-icon name="check" size="lg"></app-icon>
        </div>

        <h1 class="solved-title">Great!</h1>
        <p class="solved-message">
          Your problem has been marked as solved. If it comes back, report it again.
        </p>

        <a routerLink="/customer/home" class="btn btn-primary btn-block btn-home">
          Back to Home
        </a>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .problem-solved-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(80vh - #{$topbar-height});
      padding: 16px;
    }

    .solved-card {
      width: 100%;
      max-width: 440px;
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      @include mobile {
        border: none;
        box-shadow: none;
        background: transparent;
      }

      .status-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #dcfce7;
        color: #16a34a;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
      }

      .solved-title {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-text-primary);
        margin-bottom: 10px;
      }

      .solved-message {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.5;
        margin-bottom: 32px;
      }

      .btn-home {
        height: 48px;
        font-size: 1rem;
      }
    }
  `]
})
export class ProblemSolvedComponent implements OnInit {
  private headerService = inject(HeaderService);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Problem Solved | FixFlow');
    this.headerService.setHeader({
      title: 'Problem Solved',
      showBack: false,
      showBell: false
    });
  }
}
