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
import { switchMap, catchError, map } from 'rxjs/operators';

export function rolePermissionGuard(
  allowedRoles: string[] = [],
  requiredPermissions: string[] = []
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const roles = allowedRoles.length > 0
      ? allowedRoles
      : (route.data['allowedRoles'] ?? []);

    const permissions = requiredPermissions.length > 0
      ? requiredPermissions
      : (route.data['requiredPermissions'] ?? []);

    return authService.isAuthenticated().pipe(
      switchMap(isAuth => {
        // ✅ Vérification auth + rôle en une seule étape
        const userRole: string | null = authService.getRole?.role ?? null;

        if (!isAuth || !userRole) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return of(false);
        }

        // ✅ Rôle autorisé → accès direct sans appel réseau
        const hasRole = roles.length === 0 || roles.includes(userRole);
        if (hasRole) {
          return of(true);
        }

        // ✅ Pas de permissions requises → refus immédiat
        if (permissions.length === 0) {
          router.navigate(['/unauthorized']);
          return of(false);
        }

        // ✅ Vérification des permissions via API
        return authService.getPermissions().pipe(
          map((response: any) => {
            const userPerms: string[] = response?.result ?? [];

            // Changer `.some` par `.every` si toutes les permissions sont requises
            const hasPermission = permissions.some((perm: string) =>
              userPerms.includes(perm)
            );

            if (!hasPermission) {
              router.navigate(['/unauthorized']);
            }

            return hasPermission;
          }),
          catchError(() => {
            router.navigate(['/unauthorized']);
            return of(false);
          })
        );
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
}