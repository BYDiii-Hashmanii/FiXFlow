import { effect, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiClientService } from '../../core/api/api-client.service';
import { API } from '../../core/api/api-endpoints';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { errorMessage } from '../../core/interceptors/error.interceptor';
import { OwnerNotification } from '../models/owner.models';

@Injectable({ providedIn: 'root' })
export class OwnerNotificationService {
  private readonly api = inject(ApiClientService);
  private readonly session = inject(AuthStateService);
  readonly notifications = signal<OwnerNotification[]>([]);
  readonly failure = signal('');

  constructor() {
    effect(onCleanup => {
      const user = this.session.user();
      this.notifications.set([]);
      this.failure.set('');
      if (user?.role !== 'owner') return;
      const request = this.list().subscribe({
        error: (error: unknown) => this.failure.set(errorMessage(error, 'Could not load notifications.')),
      });
      onCleanup(() => request.unsubscribe());
    });
  }

  list() {
    return this.api.get<OwnerNotification[]>(API.owner.notifications).pipe(tap(items => this.notifications.set(items)));
  }

  markAsRead(id: string) {
    return this.api.post<{ success: boolean }>(API.notifications.read(id), {}).pipe(
      tap(() => this.notifications.update(items => items.map(item => item.id === id ? { ...item, read: true } : item))),
    );
  }

  markAllAsRead() {
    return this.api.post<{ success: boolean; markedCount: number }>(API.notifications.readAll, {}).pipe(
      tap(() => this.notifications.update(items => items.map(item => ({ ...item, read: true })))),
    );
  }
}
