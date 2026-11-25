import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { AuthStateService, SessionUser } from '../../../core/auth/auth-state.service';
import { OwnerNotificationService } from '../../services/owner-notification.service';
import { OwnerShellComponent } from './owner-shell.component';

@Component({ template: '' })
class RolesPage {}

describe('Owner logout', () => {
  const sessionKeys = ['fixflow_token', 'fixflow_role', 'fixflow_user', 'fixflow_owner_user'];

  afterEach(() => sessionKeys.forEach(key => localStorage.removeItem(key)));

  it('keeps the session on cancel and clears it on confirmation', async () => {
    const owner: SessionUser = {
      id: '1', fullName: 'Test Owner', phone: '', role: 'owner', avatarInitials: 'TO',
    };
    sessionKeys.forEach(key => localStorage.setItem(key, 'fixture'));
    TestBed.configureTestingModule({
      imports: [OwnerShellComponent],
      providers: [
        provideRouter([{ path: 'roles', component: RolesPage }]),
        { provide: ApiClientService, useValue: { get: () => of(owner) } },
        { provide: OwnerNotificationService, useValue: { notifications: signal([]) } },
      ],
    });
    const auth = TestBed.inject(AuthStateService);
    await auth.restore();
    const fixture = TestBed.createComponent(OwnerShellComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const dialogButton = (label: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
        .find(button => button.textContent?.trim() === label);

    element.querySelector<HTMLButtonElement>('.btn-logout')!.click();
    fixture.detectChanges();
    dialogButton('Cancel')!.click();
    fixture.detectChanges();
    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(auth.isLoggedIn()).toBe(true);

    element.querySelector<HTMLButtonElement>('.btn-logout')!.click();
    fixture.detectChanges();
    dialogButton('Logout')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(auth.isLoggedIn()).toBe(false);
    expect(sessionKeys.map(key => localStorage.getItem(key))).toEqual([null, null, null, null]);
    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/roles');
  });
});
