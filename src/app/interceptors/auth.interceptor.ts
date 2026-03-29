/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isRefreshUrl = req.url.includes('/refresh-token');
    let authReq = req;

    if (!isRefreshUrl) {
      const token = this.authService.getAccessToken();
      if (token) {
        authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err.status === 403) this.router.navigate(['/unauthorized']);
        if (err instanceof HttpErrorResponse && err.status === 401 && !isRefreshUrl) {
          return this.handle401(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  // intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   const isRefreshUrl = req.url.includes('/refresh-token');
  //   const isStateUser = req.url.includes('/state-user'); // ✅ AJOUT
  //   const isLogin = req.url.includes('/login'); // (optionnel mais propre)

  //   let authReq = req;

  //   if (!isRefreshUrl) {
  //     const token = this.authService.getAccessToken();
  //     if (token) {
  //       authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  //     }
  //   }

  //   return next.handle(authReq).pipe(
  //     catchError(err => {

  //       if (err.status === 403) {
  //         this.router.navigate(['/unauthorized']);
  //       }

  //       // 🚫 NE PAS refresh pour ces routes
  //       if (
  //         err instanceof HttpErrorResponse &&
  //         err.status === 401 &&
  //         !isRefreshUrl &&
  //         !isStateUser &&   // ✅ clé du fix
  //         !isLogin          // ✅ optionnel
  //       ) {
  //         return this.handle401(authReq, next);
  //       }

  //       return throwError(() => err);
  //     })
  //   );
  // }

  private handle401(request: HttpRequest<any>, next: HttpHandler) {

    // -------------- SECTION ATOMIQUE ----------------
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(
          request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        ))
      );
    }
    // ------------------------------------------------

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((res: any) => {
        const newToken = res?.access;
        if (!newToken) {
          this.authService.logout();
          console.log("accesss but not redirect first")
          this.router.navigate(['/login/']);
          return throwError(() => new Error("No token returned"));
        }

        this.authService.setAccessToken(newToken);

        // Réveille toutes les requêtes en attente
        this.refreshTokenSubject.next(newToken);

        return next.handle(
          request.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
        );
      }),
      catchError(err => {
        this.authService.logout();
        return throwError(() => err);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }

}
