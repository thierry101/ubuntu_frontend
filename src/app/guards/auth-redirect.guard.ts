import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';

export const authRedirectGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Vérification synchrone d'abord — pas d'appel HTTP si déjà null
  if (!authService.currentUser) {
    return true;
  }

  return authService.isAuthenticated().pipe(
    map(({ isAuth }) => {
      if (isAuth) {
        return router.createUrlTree(['/my-profile']);
      }
      return true;
    }),
    catchError(() => of(true))
  );
};