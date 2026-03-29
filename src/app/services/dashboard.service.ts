/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getStatDashboard(): Observable<{ total_sales_today: number, total_amount_total: number, total_tva_today: number, expensive_month: number, total_credit_today:number, total_credit_month:number }> {
    return this.http.get<{
      total_sales_today: number, total_amount_total: number, total_tva_today: number, expensive_month: number, total_credit_today:number, total_credit_month:number
    }>(`${environment.apiUrl}/retrieve-all-sell`, { withCredentials: true });
  }

  getSaleWhStore(): Observable<{ results: any }> {
    return this.http.get<{ results: any }>(`${environment.apiUrl}/sale-day-warehouse`, { withCredentials: true });
  }

  getTopSoldProduts(idWhStor: number = 0, startDate: string = '', endDate: string = ''): Observable<{ results: any }> {
    const params: string[] = [];
    if (idWhStor) {
      params.push(`warehouse=${encodeURIComponent(idWhStor)}`);
    }
    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/top-sold-products?${queryString}`, { withCredentials: true });
  }


  getTopBestClients(startDate: string = '', endDate: string = ''): Observable<{ results: any }> {
    const params: string[] = [];
    // if (idWhStor) {
    //   params.push(`warehouse=${encodeURIComponent(idWhStor)}`);
    // }
    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/top-best-clients?${queryString}`, { withCredentials: true });
  }


  getRevenueWh(startDate: string = '', endDate: string = ''): Observable<{ results: any }> {
    const params: string[] = [];
    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/revenue-warehouse?${queryString}`, { withCredentials: true });
  }


  getOrdersWhStore(page: number = 1, idWhStore?: number, startDate?: string, endDate?: string, pagination: boolean = true): Observable<{ results: any[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (startDate) {
      params.push(`startDate=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`endDate=${encodeURIComponent(endDate)}`);
    }

    if (idWhStore) {
      params.push(`idWhStore=${encodeURIComponent(idWhStore)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: any[] }>(`${environment.apiUrl}/retrieve-order-warehouse?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }
}
