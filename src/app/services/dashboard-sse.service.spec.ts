import { TestBed } from '@angular/core/testing';

import { DashboardSseService } from './dashboard-sse.service';

describe('DashboardSseService', () => {
  let service: DashboardSseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardSseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
