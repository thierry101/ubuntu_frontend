import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authAccessGuard } from './auth-access.guard';

describe('authAccessGuard', () => {
  const executeGuard: CanActivateFn = () => 
      TestBed.runInInjectionContext(() => authAccessGuard());

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
