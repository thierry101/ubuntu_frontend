import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { accessBasedRoleGuard } from './access-based-role.guard';

describe('accessBasedRoleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => accessBasedRoleGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
