/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminSetting, CountryPayment, Enterprise, InvoiceDue } from '../interfaces/global';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) { }

  getAdminSetting(): Observable<{ result: AdminSetting }> {
    return this.http.get<{ result: AdminSetting }>(`${environment.apiUrl}/set-admin-settings`, { withCredentials: true }
    );
  }

  putAdminSetting(data: any): Observable<{ result: AdminSetting }> {
    return this.http.put<{ result: AdminSetting }>(`${environment.apiUrl}/set-admin-settings`, data, { withCredentials: true }
    );
  }

  getEnterprises(page: number = 1, search: any = '', startDate: string = '', endDate: string = ''): Observable<{ results: Enterprise }> {
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
    return this.http.get<{ results: Enterprise }>(`${environment.apiUrl}/get-all-enterprises/0?${queryString}`, { withCredentials: true });
  }


  getDetailPaymentEnterprise(page: number = 1, idEnterprise: number = 0, startDate: string = '', endDate: string = ''): Observable<{ results: any }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (startDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`);
    }

    if (endDate) {
      params.push(`end_date=${encodeURIComponent(endDate)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: any }>(`${environment.apiUrl}/detail-payment-enterprise/${idEnterprise}?${queryString}`, { withCredentials: true });
  }

  deleteInvoiceManually(idInvoice: number): Observable<{ result: any }> {
    return this.http.delete<{ result: any }>(`${environment.apiUrl}/delete-invoice-manually/${idInvoice}`, { withCredentials: true }
    );
  }


  getDetailInvoice(idInvoice: number): Observable<{ result: InvoiceDue }> {
    return this.http.get<{ result: InvoiceDue }>(`${environment.apiUrl}/delete-invoice-manually/${idInvoice}`, { withCredentials: true }
    );
  }


  putDetailInvoice(idInvoice: number, data: any): Observable<{ result: InvoiceDue }> {
    return this.http.put<{ result: InvoiceDue }>(`${environment.apiUrl}/delete-invoice-manually/${idInvoice}`, data, { withCredentials: true }
    );
  }


  postInvoiceManually(data: any): Observable<{ result: InvoiceDue }> {
    return this.http.post<{ result: InvoiceDue }>(`${environment.apiUrl}/generate-invoice-manually`, data, { withCredentials: true }
    );
  }

  postPaymentBasedCountry(data: any): Observable<{ result: CountryPayment }> {
    return this.http.post<{ result: CountryPayment }>(`${environment.apiUrl}/get-save-payment-method`, data, { withCredentials: true }
    );
  }

  getPaymentBasedCountry(page: number = 1, search: any = '', startDate: string = '', endDate: string = ''): Observable<{ results: CountryPayment }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: CountryPayment }>(`${environment.apiUrl}/get-save-payment-method?${queryString}`, { withCredentials: true });
  }

  putPaymentBasedCountry(idPayment: number, data: any): Observable<{ result: CountryPayment }> {
    return this.http.put<{ result: CountryPayment }>(`${environment.apiUrl}/edit-delete-payment-method/${idPayment}`, data, { withCredentials: true }
    );
  }

  deletePaymentBasedCountry(idPayment: number): Observable<{ result: CountryPayment }> {
    return this.http.delete<{ result: CountryPayment }>(`${environment.apiUrl}/edit-delete-payment-method/${idPayment}`, { withCredentials: true }
    );
  }

  getCountryUpload(page: number = 1, search: any = '', startDate: string = '', endDate: string = '') {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get(`${environment.apiUrl}/upload-countries/?${queryString}`, { withCredentials: true });
  }

  postCountryUpload(data: any) {
    const formData = new FormData();
    formData.append('file', data);
    return this.http.post(`${environment.apiUrl}/upload-countries/`, formData, { withCredentials: true }
    );
  }


  getCitiesBasedCountry(page: number = 1, search: any = '', country: string = '', endDate: string = '') {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get(`${environment.apiUrl}/retrieve-cities/${country}/?${queryString}`, { withCredentials: true });
  }


  putCitiesBasedCountry(country: string, data: any) {
    return this.http.put(`${environment.apiUrl}/retrieve-cities/${country}/`, data, { withCredentials: true }
    );
  }


  deleteCitiesBasedCountry(country: string, data: any) {
    return this.http.delete(`${environment.apiUrl}/retrieve-cities/${country}/`, { body: data, withCredentials: true }
    );
  }


  getCitiesRegister(search: any = '', country: string = '') {
    const params: string[] = [];
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');
    return this.http.get(`${environment.apiUrl}/retrieve-cities-register/${country}/?${queryString}`, { withCredentials: true });
  }


  getFaq(page: number = 1, search: any = '', startDate: string = '', endDate: string = ''): Observable<{ results: Enterprise }> {
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
    return this.http.get<{ results: Enterprise }>(`${environment.apiUrl}/get-all-faq?${queryString}`, { withCredentials: true });
  }


  postFaq(data: any) {
    return this.http.post(`${environment.apiUrl}/build-faq`, data, { withCredentials: true }
    );
  }


  putFaq(faq_id: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-delete-faq/${faq_id}`, data, { withCredentials: true }
    );
  }


  deleteFaq(faq_id: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-faq/${faq_id}`, { withCredentials: true }
    );
  }


  postInvoice(data: any) {
    return this.http.post(`${environment.apiUrl}/upload-payment`, data, { withCredentials: true });
  }


  getAllPayments(page: number = 1, search: any = '', enterprise: string = '', type_service: string = ''): Observable<{ results: Enterprise }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (enterprise) {
      params.push(`start_date=${encodeURIComponent(enterprise)}`);
    }

    if (type_service) {
      params.push(`end_date=${encodeURIComponent(type_service)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: Enterprise }>(`${environment.apiUrl}/upload-payment?${queryString}`, { withCredentials: true });
  }


    putQtyMsg(idPayment: number, data: any) {
    return this.http.put(`${environment.apiUrl}/update-qty-whatsapp/${idPayment}`, data, { withCredentials: true }
    );
  }


  putPayment(idPayment: number, data: any) {
    return this.http.put(`${environment.apiUrl}/update-payment/${idPayment}`, data, { withCredentials: true }
    );
  }

}
