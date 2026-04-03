import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export function accessBasedRoleGuard(expectedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated().pipe(
      switchMap(isAuth => {
        const userRole: string | null = authService.getRole?.role ?? null;

        // ✅ Auth + rôle vérifiés ensemble
        if (!isAuth || !userRole) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return of(false);
        }

        if (expectedRoles.includes(userRole)) {
          return of(true);
        }

        router.navigate(['/unauthorized']);
        return of(false);
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
}