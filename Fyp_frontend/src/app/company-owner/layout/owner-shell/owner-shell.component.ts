import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';

import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { OwnerAuthService } from '../../services/owner-auth.service';
import { OwnerNotificationService } from '../../services/owner-notification.service';
import { HeaderService } from '../../../core/services/header.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-owner-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ConfirmModalComponent],
  templateUrl: './owner-shell.component.html',
  styleUrls: ['./owner-shell.component.scss'],
})
export class OwnerShellComponent {
  authService = inject(OwnerAuthService);
  notificationService = inject(OwnerNotificationService);
  headerService = inject(HeaderService);
  router = inject(Router);

  isAuthPage = false;

  constructor() {
    this.checkCurrentRoute(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed())
      .subscribe(event => {
        this.checkCurrentRoute(event.urlAfterRedirects || event.url);
      });
  }

  private checkCurrentRoute(url: string): void {
    const cleanUrl = url.split('?')[0];
    this.isAuthPage =
      cleanUrl === '/owner/login' || cleanUrl === '/login/owner' || cleanUrl.endsWith('/login');
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
    return this.notificationService.notifications().filter((n) => !n.read).length;
  }
}
