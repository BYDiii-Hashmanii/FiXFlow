import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthStateService } from '../auth/auth-state.service';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

describe('portal guards', () => {
  const snapshot = new ActivatedRouteSnapshot();
  const ownerLocation = { url: '/owner/jobs/FF-0100?return=/login/customer' } as RouterStateSnapshot;

  function routerFor(role: 'customer' | null): Router {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStateService, useValue: {
          isLoggedIn: () => role !== null, role: () => role, getHomeRoute: () => '/customer/home',
        } },
      ],
    });
    return TestBed.inject(Router);
  }

  it('redirects to the correct login even when the protected URL includes login text', () => {
    const router = routerFor(null);
    const result = TestBed.runInInjectionContext(() => authGuard(snapshot, ownerLocation));
    expect(router.serializeUrl(result as UrlTree)).toBe('/login/owner');
  });

  it('redirects a customer away from the owner portal', () => {
    const router = routerFor('customer');
    const result = TestBed.runInInjectionContext(() => roleGuard('owner')(snapshot, ownerLocation));
    expect(router.serializeUrl(result as UrlTree)).toBe('/customer/home');
  });
});
