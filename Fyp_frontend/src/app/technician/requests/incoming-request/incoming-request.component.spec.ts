import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { JobRequest } from '../../../core/models/request.model';
import { DataService } from '../../../core/services/data.service';
import { IncomingRequestComponent } from './incoming-request.component';

describe('Incoming request details', () => {
  it('loads the request for View instead of showing a false not-found state', async () => {
    const result = new Subject<JobRequest>();
    const request: JobRequest = {
      id: 'FF-1234', offerId: '7', title: 'Leaking tap', category: 'Plumbing',
      accessTime: '', description: 'A dripping tap', photoUrl: '',
      customer: { name: 'Test Customer', phone: '', address: '', distance: '', avatarInitials: 'TC' },
      urgency: '', estimatedPay: 1000, status: 'pending', createdAt: '',
    };
    const loadedIds: string[] = [];
    TestBed.configureTestingModule({
      imports: [IncomingRequestComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: request.id })) } },
        { provide: DataService, useValue: {
          pending: () => false,
          getRequestById: (id: string) => { loadedIds.push(id); return result; },
        } },
      ],
    });
    const fixture = TestBed.createComponent(IncomingRequestComponent);
    fixture.detectChanges();
    const body: HTMLElement = fixture.nativeElement;
    expect(loadedIds).toEqual([request.id]);
    expect(body.textContent).toContain('Loading incoming request');
    expect(body.textContent).not.toContain('Request Not Found');
    result.next(request);
    await fixture.whenStable();
    expect(body.textContent).toContain('Leaking tap');
    expect(body.querySelector<HTMLButtonElement>('.btn-accept')?.disabled).toBe(false);
  });
});
