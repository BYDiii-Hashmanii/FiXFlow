import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { BookingService } from '../../services/booking.service';
import { TrackingInfo } from '../../services/job-tracking.service';
import { RequestSentComponent } from './request-sent.component';

describe('Request Sent', () => {
  it.each([
    ['accepted', 'request-accepted'],
    ['declined', 'technician-declined'],
  ] as const)('renders the real quote and opens the %s screen when the offer changes', async (status, path) => {
    const result = new Subject<TrackingInfo>();
    TestBed.configureTestingModule({
      imports: [RequestSentComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'FF-42' }) } } },
        { provide: BookingService, useValue: { pollOfferStatus: () => result } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(RequestSentComponent);
    fixture.detectChanges();
    const state: TrackingInfo = {
      id: 'FF-42', requestId: 'FF-42', jobId: null, title: 'Repair tap', category: 'Plumbing',
      accessTime: null, offeredPrice: 1750, status: 'waiting', offerStatus: 'pending',
      previousTechnicianIds: ['6'], declineReason: null, retryAllowed: false, jobStatus: null,
      invoiceId: null, invoiceEligible: false,
      technician: { name: 'Test technician', company: 'Test company' } as TrackingInfo['technician'],
      timeline: { sentAt: null, respondedAt: null, acceptedAt: null, startedAt: null, completedAt: null, closedAt: null },
    };
    result.next(state);
    await fixture.whenStable();
    const body: HTMLElement = fixture.nativeElement;
    expect(body.textContent).toContain('Waiting for response');
    expect(body.textContent).toContain('Rs 1,750');

    result.next({ ...state, status, offerStatus: status });
    result.complete();
    expect(navigate).toHaveBeenCalledWith(['/customer/booking', 'FF-42', path]);
  });
});
