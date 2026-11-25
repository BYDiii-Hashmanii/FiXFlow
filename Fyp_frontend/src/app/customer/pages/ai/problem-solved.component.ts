import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-problem-solved',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="flow-screen">
      <h1 class="flow-page-title">Problem Solved</h1>
      <div class="flow-outcome solved-message">
        <span class="flow-symbol flow-success" aria-hidden="true"><app-icon name="check" size="lg" /></span>
        <h2>Great!</h2>
        <p class="flow-muted">Your problem has been marked as solved. If it comes back, report it again.</p>
      </div>
      <div class="flow-actions">
        <a routerLink="/customer/home" class="btn btn-primary">Back to Home</a>
      </div>
    </section>
  `,
  styles: ['.solved-message { padding-top: clamp(2.5rem, 12vh, 6rem); }'],
})
export class ProblemSolvedComponent {
  constructor() {
    inject(HeaderService).setHeader({
      title: 'Problem Solved', showBack: true, backUrl: '/customer/home', showBell: false,
    });
  }
}
