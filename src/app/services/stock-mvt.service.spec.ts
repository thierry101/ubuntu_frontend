import { TestBed } from '@angular/core/testing';

import { StockMvtService } from './stock-mvt.service';

describe('StockMvtService', () => {
  let service: StockMvtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockMvtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
