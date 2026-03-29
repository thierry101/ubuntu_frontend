import { TestBed } from '@angular/core/testing';

import { ColumnsVisibilityService } from './columns-visibility.service';

describe('ColumnsVisibilityService', () => {
  let service: ColumnsVisibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColumnsVisibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
