import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authRedirectGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Vérification locale — pas d'appel HTTP
  // getRole lit le cookie userInfo qui est supprimé par clearUserSession()
  const userRole = authService.getRole;

  if (userRole?.role) {
    return router.createUrlTree(['/my-profile']);
  }

  return true;
};