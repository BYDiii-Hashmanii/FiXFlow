import { inject, Injectable, signal } from '@angular/core';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { User } from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly authState = inject(AuthStateService);
  readonly currentUser = this.authState.user;

  login(phoneOrEmail: string, password: string) {
    return this.authState.login(phoneOrEmail, password, 'customer');
  }

  register(payload: { fullName: string; phone: string; email?: string; password: string }) {
    return this.authState.register(payload);
  }

  updateUser(user: User): void {
    this.authState.updateUser(user);
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
