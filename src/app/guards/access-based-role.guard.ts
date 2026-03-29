// guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export function accessBasedRoleGuard(expectedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated().pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          router.navigate(['/login']);
          return of(false);
        }

        const userRole = authService.getRole?.role || null;
        if (userRole && expectedRoles.includes(userRole)) {
          return of(true); // ✅ authenticated and role is allowed
        } else {
          router.navigate(['/unauthorized']); // ❌ authenticated but unauthorized
          return of(false);
        }
      }),
      catchError(() => {
        router.navigate(['/login']); // fallback in case of error
        return of(false);
      })
    );
  };
}
