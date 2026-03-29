/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import * as jose from 'jose';
import { LoginUser, Permission, User } from '../interfaces/global';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string | null = null;
  private permissions$ = new BehaviorSubject<any[] | null>(null);
  private loading = false;

  constructor(private http: HttpClient) { }

  // ----------------- AUTH -----------------

  apiLogin(credentials: LoginUser): Observable<{ access: string; userInfo: string }> {
    return this.http.post<{ access: string; userInfo: string }>(`${environment.apiUrl}/login`, credentials, { withCredentials: true });
  }

  logout() {
    this.accessToken = null;
    return this.http.post(`${environment.apiUrl}/logout`, {}, { withCredentials: true });
  }

isAuthenticated() {
  return this.http.get(`${environment.apiUrl}/state-user`, { withCredentials: true }).pipe(
    take(1),
    map((res) => {
      return true;
    }),
    catchError((err) => {
      return of(false);
    })
  );
}

  getPermissions(): Observable<any[] | null> {
    // Si les permissions sont déjà chargées, on retourne le cache
    if (this.permissions$.value) {
      return this.permissions$.asObservable();
    }

    // Si une requête est déjà en cours, juste retourner l'Observable
    if (this.loading) {
      return this.permissions$.asObservable();
    }

    this.loading = true;

    this.http.get<any[]>(`${environment.apiUrl}/retrieve-permissions`, { withCredentials: true })
      .pipe(
        tap(data => {
          this.permissions$.next(data);
          this.loading = false;
        }),
        catchError(error => {
          console.error('Failed to retrieve permissions:', error);
          this.permissions$.next(null); // ou []
          this.loading = false;
          return of(null);
        })
      )
      .subscribe();

    return this.permissions$.asObservable();
  }

  // Optionnel : pour forcer un refresh manuel
  refreshPermissions() {
    this.permissions$.next(null);
    return this.getPermissions();
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
  // getUsers() {
  //   return this.http.get(`${environment.apiUrl}/get-all-users`, { withCredentials: true });
  // }

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


  // ----------------- OPTIONAL: TOKEN PARSING -----------------
  get getRole(): any {
    try {
      const token = this.getTokenFromCookie('userInfo') || '';
      if (!token) return null;
      const claims = jose.decodeJwt(token);
      return Object(claims);
    } catch (e) {
      return null;
    }
  }

  getTokenFromCookie(keyCookie: string): string | null {
    const match = document.cookie.match(new RegExp(`(^| )${keyCookie}=([^;]+)`));
    return match ? match[2] : null;
  }

  storeTokenInCookie(keyCookie: string, token: string): void {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // Expires in 1 years
    document.cookie = `${keyCookie}=${token};expires=${expires.toUTCString()};path=/`;
  }

  //**************************************** Retrieve and edit profile ****************************************
  getProfile(): Observable<{ result: User }> {
    return this.http.get<{ result: User }>(`${environment.apiUrl}/get-edit-profile`, { withCredentials: true });
  }

  putProfile(data: any): Observable<{ result: boolean }> {
    return this.http.put<{ result: boolean }>(`${environment.apiUrl}/get-edit-profile`, data, { withCredentials: true });
  }

}
