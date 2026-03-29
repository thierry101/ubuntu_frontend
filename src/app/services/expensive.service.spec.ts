import { TestBed } from '@angular/core/testing';

import { ExpensiveService } from './expensive.service';

describe('ExpensiveService', () => {
  let service: ExpensiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpensiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
