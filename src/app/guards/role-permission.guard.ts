/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/guards/role-permission.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

/**
 * Guard avec fonction factory pour vérifier les rôles ET les permissions
 * @param allowedRoles - Tableau des rôles autorisés
 * @param requiredPermissions - Tableau des permissions requises (optionnel)
 */
export function rolePermissionGuard(
  allowedRoles: string[] = [],
  requiredPermissions: string[] = []
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // ✅ Fusionner avec les données de la route si présentes
    const roles = allowedRoles.length > 0
      ? allowedRoles
      : (route.data['allowedRoles'] || []);

    const permissions = requiredPermissions.length > 0
      ? requiredPermissions
      : (route.data['requiredPermissions'] || []);

    return authService.isAuthenticated().pipe(
      switchMap(isAuth => {
        // Si pas authentifié, rediriger vers login
        if (!isAuth) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return of(false);
        }

        // Récupérer le rôle de l'utilisateur
        const user = authService.getRole;
        const userRole = user?.role || null;

        if (!userRole) {
          router.navigate(['/login']);
          return of(false);
        }

        // Vérifier si le rôle est autorisé
        const hasRole = roles.length === 0 || roles.includes(userRole);

        if (hasRole) {
          return of(true); // ✅ Authentifié et rôle autorisé
        }

        // Si pas le bon rôle, vérifier les permissions
        if (permissions.length === 0) {
          router.navigate(['/unauthorized']);
          return of(false);
        }

        // Vérification des permissions
        return authService.getPermissions().pipe(
          map((permissionsResponse: any) => {
            const userPerms = permissionsResponse?.result || [];
            const hasPermission = permissions.some((perm: any) =>
              userPerms.includes(perm)
            );

            if (hasPermission) {
              return true; // ✅ Permission accordée
            } else {
              router.navigate(['/unauthorized']);
              return false; // ❌ Pas de permission
            }
          }),
          catchError((error) => {
            console.error('Erreur lors de la vérification des permissions:');
            router.navigate(['/unauthorized']);
            return of(false);
          })
        );
      }),
      catchError((error) => {
        console.error('Erreur d\'authentification:');
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
}