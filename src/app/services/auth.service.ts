/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, take } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import * as jose from 'jose';
import { LoginUser, Permission, User } from '../interfaces/global';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string | null = null;
  private permissions$ = new BehaviorSubject<any[] | null>(null);
  private currentUser$ = new BehaviorSubject<any | null>(null);

  constructor(private http: HttpClient) { }

  // ----------------- AUTH -----------------

  apiLogin(credentials: LoginUser): Observable<{ access: string; userInfo: string }> {
    return this.http.post<{ access: string; userInfo: string }>(`${environment.apiUrl}/login`, credentials, { withCredentials: true });
  }

  logout() {
    this.accessToken = null;
    this.currentUser$.next(null);      // ✅ vider immédiatement
    this.permissions$.next(null);
    return this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true });
  }


  isAuthenticated(): Observable<{ isAuth: boolean }> {
    return this.http.get<{ result: any; permissions: string[]; nber_wh_stores: number }>
      (`${environment.apiUrl}/state-user`, { withCredentials: true }).pipe(
        take(1),
        map((res) => {
          this.currentUser$.next({
            ...res.result,
            permissions: res.permissions ?? [],
            nber_wh_stores: res.nber_wh_stores ?? 0
          });
          this.permissions$.next(res.permissions ?? []);
          return { isAuth: true };
        }),
        catchError(() => {
          this.currentUser$.next(null);
          this.permissions$.next(null);
          return of({ isAuth: false });
        })
      );
  }


  // Getter pour accéder à l'utilisateur dans les components
  get currentUser(): any | null {
    return this.currentUser$.getValue();
  }

  // Observable pour les components qui ont besoin de réactivité, donc si changement, les valeurs à jour sont renvoyées
  // getCurrentUser(): Observable<any | null> {
  //   return this.currentUser$.asObservable();
  // }

  get currentPermissions(): string[] {
    return this.permissions$.getValue() ?? [];
  }


  refreshToken(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/refresh-token`, {}, { withCredentials: true })
  }


  // ----------------- ACCESS TOKEN -----------------
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }


  getAccessToken(): string | null {
    return this.accessToken;
  }


  // ----------------- OTHER API -----------------
  postRegister(data: User) {
    return this.http.post(`${environment.apiUrl}/register`, data, { withCredentials: true });
  }


  getInfoRegister() {
    return this.http.get(`${environment.apiUrl}/register`, { withCredentials: true });
  }


  postRegisterByAdmin(data: any): Observable<{ result: User }> {
    return this.http.post<{ result: User }>(`${environment.apiUrl}/register-user-admin`, data, { withCredentials: true });
  }


  putUser(idUser: number, data: any): Observable<{ result: User }> {
    return this.http.put<{ result: User }>(`${environment.apiUrl}/edit-delete-user/${idUser}`, data, { withCredentials: true });
  }


  deleteUser(idUser: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-user/${idUser}`, { withCredentials: true });
  }


  getRegisterByAdmin(page: number = 1, search: string = ''): Observable<{ results: User[] }> {
    if (search) {
      return this.http.get<{ results: User[] }>(`${environment.apiUrl}/register-user-admin?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: User[] }>(`${environment.apiUrl}/register-user-admin?page=${page}`, { withCredentials: true });
    }
  }


  getPermission(page: number = 1, search: string = '') {
    const url = search
      ? `${environment.apiUrl}/assign-permissions?page=${page}&search=${encodeURIComponent(search)}`
      : `${environment.apiUrl}/assign-permissions?page=${page}`;
    return this.http.get(url, { withCredentials: true });
  }


  postPermission(data: any): Observable<{ result: Permission }> {
    return this.http.post<{ result: Permission }>(`${environment.apiUrl}/assign-permissions`, data, { withCredentials: true });
  }


  putPermission(idPerm: number, data: any): Observable<{ result: Permission }> {
    return this.http.put<{ result: Permission }>(`${environment.apiUrl}/edit-delete-permissions/${idPerm}`, data, { withCredentials: true });
  }


  deletePermission(idPerm: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-permissions/${idPerm}`, { withCredentials: true });
  }


  rePostOtp(email: string) {
    return this.http.post(`${environment.apiUrl}/resend-otp`, { email }, { withCredentials: true });
  }


  postConfirmOtp(data: any) {
    return this.http.post(`${environment.apiUrl}/check-otp`, data, { withCredentials: true });
  }


  postResetPassword(data: any) {
    return this.http.post(`${environment.apiUrl}/password-reset`, data, { withCredentials: true });
  }


  postSetNewPassword(data: any, uidb64: string, token: string) {
    return this.http.post(`${environment.apiUrl}/password-reset-confirm/${uidb64}/${token}`, data, { withCredentials: true });
  }


  //**************************************** Retrieve and edit profile ****************************************
  getProfile(): Observable<{ result: User }> {
    return this.http.get<{ result: User }>(`${environment.apiUrl}/get-edit-profile`, { withCredentials: true });
  }


  putProfile(data: any): Observable<{ result: boolean }> {
    return this.http.put<{ result: boolean }>(`${environment.apiUrl}/get-edit-profile`, data, { withCredentials: true });
  }

}
