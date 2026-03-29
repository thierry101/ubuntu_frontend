/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartProducts, Expensive, InvoiceDue, Orders, SaveExpensive } from '../interfaces/global';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ExpensiveService {

  constructor(private http: HttpClient) { }


  getExpensive(): Observable<{ results: Expensive[] }> {
    return this.http.get<{ results: Expensive[] }>(`${environment.apiUrl}/post-get-expensive`, { withCredentials: true }
    );
  }

  postExpensive(data: any): Observable<{ result: Expensive }> {
    return this.http.post<{ result: Expensive }>(`${environment.apiUrl}/post-get-expensive`, data, { withCredentials: true }
    );
  }

  putExpensive(idExpensive: number, data: any): Observable<{ result: Expensive }> {
    return this.http.put<{ result: Expensive }>(`${environment.apiUrl}/edit-delete-expensive/${idExpensive}`, data, { withCredentials: true })
  }

  deleteExpensive(idExpensive: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-expensive/${idExpensive}`, { withCredentials: true })
  }

  retrieveExpensive(): Observable<{ results: Expensive[] }> {
    return this.http.get<{ results: Expensive[] }>(`${environment.apiUrl}/retrieve-expensive`, { withCredentials: true }
    );
  }

  postSaveExpensive(data: any): Observable<{ result: SaveExpensive }> {
    return this.http.post<{ result: SaveExpensive }>(`${environment.apiUrl}/save-expensive`, data, { withCredentials: true }
    );
  }

  deleteSaveExpensive(idExpensive: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-savexpensive/${idExpensive}`, { withCredentials: true })
  }


  getSaveExpensive(page: number = 1, search: any = '', selectWhShop?: number, startDate: string = '', endDate: string = '', pagination: boolean = true): Observable<{ results: SaveExpensive[] }> {
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

    if (selectWhShop) {
      params.push(`selectWhShop=${encodeURIComponent(selectWhShop)}`);
    }
    if (pagination) {
      params.push(`pagination=${encodeURIComponent(pagination)}`);
    }
    const queryString = params.join('&');
    return this.http.get<{ results: SaveExpensive[] }>(`${environment.apiUrl}/save-expensive?${queryString}`, { withCredentials: true });
  }

  postAddInvoice(data: any): Observable<{ result: CartProducts }> {
    return this.http.post<{ result: CartProducts }>(`${environment.apiUrl}/add-product-invoice`, data, { withCredentials: true }
    );
  }

  getAddInvoice(): Observable<{ results: CartProducts[] }> {
    return this.http.get<{ results: CartProducts[] }>(`${environment.apiUrl}/add-product-invoice`, { withCredentials: true }
    );
  }

  deleteAddInvoice(idItem: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-invoice/${idItem}`, { withCredentials: true }
    );
  }

  postConfirmInvoice(data: any): Observable<{ result: Orders }> {
    return this.http.post<{ result: Orders }>(`${environment.apiUrl}/confirm-invoice-proforma`, data, { withCredentials: true }
    );
  }

  getConfirmInvoice(page: number = 1, search: any = '', selectWhShop: number = 0, startDate: string = '', endDate: string = '', pagination: boolean = true): Observable<any> {
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
    if (pagination) {
      params.push(`pagination=${encodeURIComponent(pagination)}`);
    }
    const queryString = params.join('&');
    return this.http.get<any>(`${environment.apiUrl}/confirm-invoice-proforma?${queryString}`, { withCredentials: true });
  }

  deleteConfirmAddInvoice(idItem: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-invoice-proforma/${idItem}`, { withCredentials: true }
    );
  }

  getAllExpensives(idWhStor: number, monthProfit: string): Observable<{ results: any }> {
    const params: string[] = [];
    params.push(`idWhStore=${idWhStor}`);
    if (monthProfit) {
      params.push(`monthProfit=${encodeURIComponent(monthProfit)}`);
    }
    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/calculate-benefict?${queryString}`, { withCredentials: true }
    );
  }


  getOrderForCreditInvoice(page: number = 1, search: string = ''): Observable<{ results: InvoiceDue[] }> {
    if (search) {
      return this.http.get<{ results: InvoiceDue[] }>(`${environment.apiUrl}/invoice-for-credit/?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: InvoiceDue[] }>(`${environment.apiUrl}/invoice-for-credit/?page=${page}`, { withCredentials: true });
    }
  }


}
