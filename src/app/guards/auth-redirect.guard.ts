import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { map, catchError, of, take } from 'rxjs';

export const authRedirectGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    take(1), // 👈 crucial
    map(isAuthenticated => {
      if (isAuthenticated) {
        return router.createUrlTree(['/my-profile']);
      }
      return true;
    }),
    catchError(() => of(true))
  );
};