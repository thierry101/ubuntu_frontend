import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authRedirectGuard } from './auth-redirect.guard';

describe('authRedirectGuard', () => {
  const executeGuard: CanActivateFn = () => 
      TestBed.runInInjectionContext(() => authRedirectGuard());

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
