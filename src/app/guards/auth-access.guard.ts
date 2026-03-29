import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';

export const authAccessGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        // 🚫 utilisateur non connecté → redirection vers login
        return router.createUrlTree(['/login']);
      }
      // ✅ utilisateur connecté → accès autorisé
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login']))) // en cas d’erreur → login
  );
};