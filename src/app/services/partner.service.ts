/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Partner } from '../interfaces/global';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {

  constructor(private http: HttpClient) { }


  postRegisterPartner(data: Partner): Observable<{ result: Partner }> {
    return this.http.post<{ result: Partner }>(`${environment.apiUrl}/register-partner`, data, { withCredentials: true }
    );
  }


  getRegisterPartner(page: number = 1, search: any = '', startDate: string = '', endDate: string = ''): Observable<{ results: Partner }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: Partner }>(`${environment.apiUrl}/get-all-partner/0?${queryString}`, { withCredentials: true });
  }


  putRegisterPartner(data: Partner, idPartner: number): Observable<{ result: Partner }> {
    return this.http.put<{ result: Partner }>(`${environment.apiUrl}/get-all-partner/${idPartner}`, data, { withCredentials: true }
    );
  }


  deleteRegisterPartner(idPartner: number): Observable<{ result: Partner }> {
    return this.http.delete<{ result: Partner }>(`${environment.apiUrl}/get-all-partner/${idPartner}`, { withCredentials: true }
    );
  }


  getSettingPartner(): Observable<{ result: Partner }> {
    return this.http.get<{ result: Partner }>(`${environment.apiUrl}/setting-partner`, { withCredentials: true }
    );
  }

  putSettingPartner(data: Partner): Observable<{ result: Partner }> {
    return this.http.put<{ result: Partner }>(`${environment.apiUrl}/setting-partner`, data, { withCredentials: true }
    );
  }

  enterprisePartner(page: number = 1, search: any = ''): Observable<{ results: Partner }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: Partner }>(`${environment.apiUrl}/retrieve-enterprise-partner?${queryString}`, { withCredentials: true });
  }

  getenterpriseInvoicePartner(page: number = 1, search: any = '', idEnterprise: number = 0): Observable<{ results: any }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/retrieve-enterprise-partner-invoices/${idEnterprise}?${queryString}`, { withCredentials: true });
  }

  getInvoiceEnterprisePartner(page: number = 1, search: any = '', monthInvoice: any = ''): Observable<{ results: any }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (monthInvoice) {
      params.push(`monthInvoice=${encodeURIComponent(monthInvoice)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/retrieve-invoice-partner?${queryString}`, { withCredentials: true });
  }
}

