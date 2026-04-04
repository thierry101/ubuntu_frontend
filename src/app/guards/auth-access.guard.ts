import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';

export const authAccessGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map(({ isAuth }) => {
      if (!isAuth) return router.createUrlTree(['/login']);
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};