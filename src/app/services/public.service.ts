/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { AdminSetting, AuditLog, Enterprise, OpenHour, Warehouse } from '../interfaces/global';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private enterpriseCustomisationSubject = new BehaviorSubject<Enterprise | null>(null);
  public enterpriseCustomisation$ = this.enterpriseCustomisationSubject.asObservable();
  private cachedSettings$?: Observable<{ result: Enterprise, typePayments: any }>;
  private adminSettingSubject = new BehaviorSubject<AdminSetting | null>(null);
  // Observable public que les composants vont consommer
  adminSetting$ = this.adminSettingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadEnterpriseSettings()
    this.loadAdminSetting().subscribe();
  }

  getSettingEtprise(): Observable<Enterprise> {
    return this.http.get<Enterprise>(`${environment.apiUrl}/setting-enterprise`, { withCredentials: true });
  }

  postSettingEtprise(data: any) {
    return this.http.post(`${environment.apiUrl}/setting-enterprise`, data, { withCredentials: true }).pipe(
      // After successful post, reload settings
      tap(() => this.loadEnterpriseSettings()));
  }

  // getSettingEtpriseForCustomisation(): Observable<{ result: Enterprise, typePayments: any }> {
  //   return this.http.get<{ result: Enterprise, typePayments: any }>(`${environment.apiUrl}/get-setting-enterprise`, { withCredentials: true });
  // }

  getSettingEtpriseForCustomisation(): Observable<{ result: Enterprise, typePayments: any }> {
    if (!this.cachedSettings$) {
      this.cachedSettings$ = this.http.get<{ result: Enterprise, typePayments: any }>(
        `${environment.apiUrl}/get-setting-enterprise`,
        { withCredentials: true }
      ).pipe(
        shareReplay(1), // partage la réponse entre tous les abonnés
        catchError(err => {
          this.cachedSettings$ = undefined; // reset si erreur
          return of({ result: {} as Enterprise, typePayments: [] }); // fallback
        })
      );
    }
    return this.cachedSettings$;
  }

  getWarehouseStore(): Observable<{ result: Warehouse[] }> {
    return this.http.get<{ result: Warehouse[] }>(`${environment.apiUrl}/register-warehouse-store`, { withCredentials: true })
  }

  postWarehouseStore(data: any): Observable<{ warehouse: Warehouse }> {
    return this.http.post<{ warehouse: Warehouse }>(`${environment.apiUrl}/register-warehouse-store`, data, { withCredentials: true }
    );
  }

  putWarehouseStore(idWhStor: number, data: any): Observable<{ warehouse: Warehouse }> {
    return this.http.put<{ warehouse: Warehouse }>(`${environment.apiUrl}/edit-warehouse-store/${idWhStor}`, data, { withCredentials: true })
  }

  deleteWarehouseStore(idWhStor: number) {
    return this.http.delete(`${environment.apiUrl}/edit-warehouse-store/${idWhStor}`, { withCredentials: true })
  }

  getWarehousesStores(): Observable<{ result: Warehouse[] }> {
    return this.http.get<{ result: Warehouse[] }>(`${environment.apiUrl}/retrieve-warehouse-store`, { withCredentials: true })
  }


  getPaymentWhStore(): Observable<{ result: any }> {
    return this.http.get<{ result: any }>(`${environment.apiUrl}/retrieve-payment-wh-store`, { withCredentials: true })
  }

  getAllCountries(search: string) {
    const params: string[] = [];
    params.push(`search=${search}`);
    const queryString = params.join('&');
    return this.http.get(`${environment.apiUrl}/retrieve-countries/?${queryString}`, { withCredentials: true })
  }


  getAllCities(country_id: number, search: string) {
    const params: string[] = [];
    params.push(`search=${search}`);
    const queryString = params.join('&');
    return this.http.get(`${environment.apiUrl}/retrieve-all-cities/${country_id}/?${queryString}`, { withCredentials: true })
  }


  getPayment(idWhStor: number): Observable<{ result: any[], serialOpenHour: OpenHour[] }> {
    return this.http.get<{ result: any[], serialOpenHour: OpenHour[] }>(`${environment.apiUrl}/retrieve-payment/${idWhStor}`, { withCredentials: true })
  }


  getAudiLogs(page: number = 1, search: string = '', startDate?: string, endDate?: string): Observable<{ results: AuditLog[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    if (startDate) {
      params.push(`startDate=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`endDate=${encodeURIComponent(endDate)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: AuditLog[] }>(`${environment.apiUrl}/retrieve-log?${queryString}`, { withCredentials: true });
  }


  loadEnterpriseSettings(): void {
    this.getSettingEtpriseForCustomisation().subscribe({
      next: (response: { result: Enterprise, typePayments: any }) => {
        this.enterpriseCustomisationSubject.next(response?.result);
      },
      error: (err) => {
        alert('Failed to load enterprise settings');
        // console.error('Failed to load enterprise settings', err);
      }
    });
  }


  createPayment(data: any): Observable<{ warehouse: Warehouse }> {
    return this.http.post<{ warehouse: Warehouse }>(`${environment.apiUrl}/paiement`, data, { withCredentials: true }
    );
  }

  // Charge et stocke le résultat dans le BehaviorSubject
  loadAdminSetting(): Observable<{ result: AdminSetting }> {
    return this.http.get<{ result: AdminSetting }>(`${environment.apiUrl}/get-admin-setting`, { withCredentials: true }).pipe(
      tap(response => this.adminSettingSubject.next(response?.result))
    );
  }

  // Getter direct pour la valeur courante (sans subscribe)
  get adminSettingSnapshot(): AdminSetting | null {
    return this.adminSettingSubject?.getValue();
  }

}

