import { TestBed } from '@angular/core/testing';

import { ArticleManagementService } from './article-management.service';

describe('ArticleManagementService', () => {
  let service: ArticleManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
