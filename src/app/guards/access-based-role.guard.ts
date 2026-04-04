import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export function accessBasedRoleGuard(expectedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated().pipe(
      map(({ isAuth }) => {
        const role = authService.currentUser?.role ?? null;

        if (!isAuth || !role) {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        if (expectedRoles.includes(role)) return true;

        router.navigate(['/unauthorized']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
}