import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AuthStateService } from '../auth/auth-state.service';
import { environment } from '../config/environment';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';

describe('session interceptors', () => {
  const expire = vi.fn();
  let transport: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    expire.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStateService, useValue: { token: () => 'fixture-token', expireSession: expire } },
      ],
    });
    transport = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => transport.verify());

  it('attaches the token only to the configured API origin and path', () => {
    const trusted = environment.apiUrl + '/auth/me';
    const external = 'https://media.example.test/api/auth/me';
    http.get(trusted).subscribe();
    http.get(external).subscribe();
    const local = transport.expectOne(trusted);
    const other = transport.expectOne(external);
    expect(local.request.headers.get('Authorization')).toBe('Bearer fixture-token');
    expect(other.request.headers.has('Authorization')).toBe(false);
    local.flush({});
    other.flush({});
  });

  it('preserves login errors and expires the session only for protected API responses', () => {
    for (const path of ['/auth/login', '/auth/me']) {
      const url = environment.apiUrl + path;
      let received: HttpErrorResponse | undefined;
      http.get(url).subscribe({ error: (error: HttpErrorResponse) => { received = error; } });
      transport.expectOne(url).flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
      expect(received?.status).toBe(401);
      expect(expire).toHaveBeenCalledTimes(path === '/auth/login' ? 0 : 1);
    }
  });
});
