/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Catalog, CommandsCatalog, CountryPayment, InvoiceDue, Product, SettingCatalog } from '../interfaces/global';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private http: HttpClient) {
  }

  getSettingCatalog(): Observable<{ result: SettingCatalog }> {
    return this.http.get<{ result: SettingCatalog }>(`${environment.apiUrl}/setting-catalog`, { withCredentials: true }
    );
  }

  postSettingCatalog(data: any): Observable<{ result: SettingCatalog }> {
    return this.http.post<{ result: SettingCatalog }>(`${environment.apiUrl}/setting-catalog`, data, { withCredentials: true }
    );
  }

  getAllCatalogs(page: number = 1, search: string = ''): Observable<{ results: Catalog[] }> {
    if (search) {
      return this.http.get<{ results: Catalog[] }>(`${environment.apiUrl}/post-catalog-product?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Catalog[] }>(`${environment.apiUrl}/post-catalog-product?page=${page}`, { withCredentials: true });
    }
  }

  getAllProductsEcommerce(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-products-ecommerce?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-products-ecommerce?page=${page}`, { withCredentials: true });
    }
  }

  postCatalog(data: Catalog): Observable<{ result: Catalog }> {
    return this.http.post<{ result: Catalog }>(`${environment.apiUrl}/post-catalog-product`, data, { withCredentials: true }
    );
  }


  getCatalog(idCatalog: number): Observable<{ result: Catalog }> {
    return this.http.get<{ result: Catalog }>(`${environment.apiUrl}/edit-catalog-product/${idCatalog}`, { withCredentials: true }
    );
  }


  putCatalog(data: any, idCatalog: number): Observable<{ result: Catalog }> {
    return this.http.put<{ result: Catalog }>(`${environment.apiUrl}/edit-catalog-product/${idCatalog}`, data, { withCredentials: true }
    );
  }


  deleteCatalog(idCatalog: number): Observable<{ result: Catalog }> {
    return this.http.delete<{ result: Catalog }>(`${environment.apiUrl}/edit-catalog-product/${idCatalog}`, { withCredentials: true }
    );
  }

  getInvoices(): Observable<{ result: InvoiceDue }> {
    return this.http.get<{ result: InvoiceDue }>(`${environment.apiUrl}/retrieve-all-invoices`, { withCredentials: true }
    );
  }

  getMyPayments(): Observable<{ result: CountryPayment[] }> {
    return this.http.get<{ result: CountryPayment[] }>(`${environment.apiUrl}/get-payments-method`, { withCredentials: true }
    );
  }

  getCommands(page: number = 1, search: any = '', selectWhShop?: number, startDate: string = '', endDate: string = '', pagination: boolean = true): Observable<{ results: CommandsCatalog[] }> {
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
    return this.http.get<{ results: CommandsCatalog[] }>(`${environment.apiUrl}/retrive-commands?${queryString}`, { withCredentials: true });
  }

  putAffectCmd(data: any, idCatalog: number): Observable<{ result: Catalog }> {
    return this.http.put<{ result: Catalog }>(`${environment.apiUrl}/affect-commands/${idCatalog}`, data, { withCredentials: true }
    );
  }
}

