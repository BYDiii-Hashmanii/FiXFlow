import { inject, Injectable, signal } from '@angular/core';
import { AuthStateService } from '../../core/auth/auth-state.service';

@Injectable({ providedIn: 'root' })
export class OwnerAuthService {
  private readonly authState = inject(AuthStateService);
  readonly currentUser = this.authState.user;

  login(phoneOrEmail: string, password: string) {
    return this.authState.login(phoneOrEmail, password, 'owner');
  }

  readonly showLogoutModal = signal(false);

  openLogoutModal(): void {
    this.showLogoutModal.set(true);
  }

  closeLogoutModal(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    this.closeLogoutModal();
    this.authState.logout();
  }
}
