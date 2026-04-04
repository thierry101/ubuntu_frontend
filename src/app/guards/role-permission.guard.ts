/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function rolePermissionGuard(
  allowedRoles: string[] = [],
  requiredPermissions: string[] = []
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const roles = allowedRoles.length > 0 ? allowedRoles : (route.data['allowedRoles'] ?? []);
    const permissions = requiredPermissions.length > 0 ? requiredPermissions : (route.data['requiredPermissions'] ?? []);

    return authService.isAuthenticated().pipe(
      map(({ isAuth }) => {
        const role = authService.currentUser?.role ?? null;

        if (!isAuth || !role) {
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        const hasRole = roles.length === 0 || roles.includes(role);
        if (hasRole) return true;

        if (permissions.length === 0) {
          router.navigate(['/unauthorized']);
          return false;
        }

        // ✅ Synchrone, plus d'appel réseau
        const userPerms: string[] = authService.currentPermissions ?? [];
        const hasPermission = permissions.some((perm:any) => userPerms.includes(perm));

        if (!hasPermission) router.navigate(['/unauthorized']);
        return hasPermission;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
}