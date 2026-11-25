import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CustomerAuthService } from '../../services/customer-auth.service';
import { NotificationService } from '../../services/notification.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-customer-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    ConfirmModalComponent
  ],
  templateUrl: './customer-shell.component.html',
  styleUrls: ['./customer-shell.component.scss']
})
export class CustomerShellComponent {
  authService = inject(CustomerAuthService);
  notificationService = inject(NotificationService);
  headerService = inject(HeaderService);
  router = inject(Router);

  isAuthPage = false;

  constructor() {
    this.checkCurrentRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(event => {
      this.checkCurrentRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkCurrentRoute(url: string): void {
    const cleanUrl = url.split('?')[0];
    this.isAuthPage =
      cleanUrl === '/customer/splash' ||
      cleanUrl === '/customer/login' ||
      cleanUrl === '/customer/sign-up' ||
      cleanUrl === '/customer' ||
      cleanUrl === '';
  }

  goBack(): void {
    const config = this.headerService.config();
    if (config.backUrl) {
      this.router.navigateByUrl(config.backUrl);
    } else {
      window.history.back();
    }
  }

  get unreadCount(): number {
    return this.notificationService.notifications().filter(n => !n.read).length;
  }
}
