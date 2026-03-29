/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class authInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private route:Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isRefreshTokenUrl = req.url.includes('/refresh-token');
    let authReq = req;

    if (!isRefreshTokenUrl) {
      const accessToken = this.authService.getAccessToken();
      if (accessToken) {
        authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` }
        });
      }
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if(error.status === 403){
          this.route.navigate(['/unauthorized'])
        }
        if (error instanceof HttpErrorResponse && error?.status === 401 && !isRefreshTokenUrl) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          const newAccessToken = res?.access;
          if (newAccessToken) {
            this.authService.setAccessToken(newAccessToken);
            this.refreshTokenSubject?.next(newAccessToken);
            return next.handle(
              request.clone({ setHeaders: { Authorization: `Bearer ${newAccessToken}` } })
            );
          } else {
            return throwError(() => new Error('No access token from refresh'));
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          this.authService.logout(); // Ensure logout or redirect
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => !!token),
        take(1),
        switchMap(token => {
          return next.handle(
            request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          );
        })
      );
    }
  }
}