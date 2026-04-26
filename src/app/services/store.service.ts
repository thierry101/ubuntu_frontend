/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { CartProducts, Client, CreditNote, Orders } from '../interfaces/global';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private http: HttpClient) { }

  getProductsForStore(page: number = 1, search: string = ''): Observable<{ results: any[] }> { //get products in warehouse with the quantity
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/retrieve-products-store-Warehouse?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/retrieve-products-store-Warehouse?page=${page}`, { withCredentials: true });
    }
  }

  getDetailStockProduct(indiceStock: any): Observable<{ result: any }> {
    return this.http.get<{ result: any }>(`${environment.apiUrl}/detail-stock-store/${indiceStock}`, { withCredentials: true });
  }

  postAddToCart(idLot: number, data: any): Observable<{ product: any }> { //to register product
    return this.http.post<{ product: any }>(`${environment.apiUrl}/add-to-cart/${idLot}`, data, { withCredentials: true });
  }

  getCartProducts(): Observable<{ result: CartProducts[], typePayments: any, serializerShop: any, devise: string }> { //to register product
    return this.http.get<{ result: CartProducts[], typePayments: any, serializerShop: any, devise: string }>(`${environment.apiUrl}/retrieve-cart`, { withCredentials: true });
  }

  getClients(page: number = 1, search: string = ''): Observable<{ clients: Client[] }> {
    const url = search
      ? `${environment.apiUrl}/retrieve-clients?page=${page}&search=${encodeURIComponent(search)}`
      : `${environment.apiUrl}/retrieve-clients?page=${page}`;
    return this.http.get<{ clients: Client[] }>(url, { withCredentials: true });
  }

  delProdToCart(idProdCart: number): Observable<{ product: any }> { //to register product
    return this.http.delete<{ product: any }>(`${environment.apiUrl}/edit-delete-client/${idProdCart}`, { withCredentials: true });
  }

  editProdToCart(idProdCart: number, data: any): Observable<{ result: CartProducts }> { //to register product
    return this.http.post<{ result: CartProducts }>(`${environment.apiUrl}/edit-delete-client/${idProdCart}`, data, { withCredentials: true });
  }

  postOrder(data: any): Observable<{ result: Orders }> {
    return this.http.post<{ result: Orders }>(`${environment.apiUrl}/confirm-cart`, data, { withCredentials: true });
  }

  getOrders(page: number = 1, search: any = '', selectWhShop?: number, startDate: string = '', endDate: string = '', payment: string = '', pagination: boolean = true, selectType: any = '0'): Observable<{ results: Orders[] }> {
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

    if (payment) {
      params.push(`payment=${encodeURIComponent(payment)}`);
    }

    if (selectWhShop) {
      params.push(`selectWhShop=${encodeURIComponent(selectWhShop)}`);
    }
    // if (selectType) {
    params.push(`typeSelected=${encodeURIComponent(selectType)}`);
    // }
    if (pagination) {
      params.push(`pagination=${encodeURIComponent(pagination)}`);
    }
    const queryString = params.join('&');
    return this.http.get<{ results: Orders[] }>(`${environment.apiUrl}/retrieve-order-cart?${queryString}`, { withCredentials: true });
  }


  getCreditsNote(page: number = 1, search: any = '', selectWhShop?: number, startDate: string = '', endDate: string = '', payment: string = '', pagination: boolean = true, selectType: any = '0'): Observable<{ results: Orders[] }> {
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

    if (payment) {
      params.push(`payment=${encodeURIComponent(payment)}`);
    }

    if (selectWhShop) {
      params.push(`selectWhShop=${encodeURIComponent(selectWhShop)}`);
    }
    // if (selectType) {
    params.push(`typeSelected=${encodeURIComponent(selectType)}`);
    // }
    if (pagination) {
      params.push(`pagination=${encodeURIComponent(pagination)}`);
    }
    const queryString = params.join('&');
    return this.http.get<{ results: Orders[] }>(`${environment.apiUrl}/retrieve-credits-note?${queryString}`, { withCredentials: true });
  }


  getCreditNote(idcreditNote: number): Observable<{ result: CreditNote, serial_deposit: any }> {
    return this.http.get<{ result: CreditNote, serial_deposit: any }>(`${environment.apiUrl}/detail-credit-note/${idcreditNote}`, { withCredentials: true });
  }


  putCreditNote(idcreditNote: number, data: any): Observable<{ result: any }> {
    return this.http.put<{ result: any }>(`${environment.apiUrl}/detail-credit-note/${idcreditNote}`, data, { withCredentials: true });
  }


  delOrder(idOrder: number) { //to register product
    return this.http.delete(`${environment.apiUrl}/retrieve-detail-order/${idOrder}`, { withCredentials: true });
  }


  getInvoiceDetail(idInvoice: number): Observable<{ product: any }> {
    return this.http.get<{ product: any }>(`${environment.apiUrl}/retrieve-detail-order/${idInvoice}`, { withCredentials: true });
  }


  postCheckCoupon(idClient: number, data: any): Observable<{ result: Orders }> {
    return this.http.post<{ result: Orders }>(`${environment.apiUrl}/check-coupon/${idClient}`, data, { withCredentials: true });
  }


  getAllCoupon(idClient: number): Observable<{ result: any }>{
    return this.http.get<{ result: any }>(`${environment.apiUrl}/check-coupon/${idClient}`, { withCredentials: true });
  }


  getOrdersDeposit(page: number = 1, search: any = '', selectWhShop?: number, startDate?: string, endDate?: string, payment?: string, pagination: boolean = true): Observable<{ results: Orders[] }> {
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

    const queryString = params.join('&');

    return this.http.get<{ results: Orders[] }>(`${environment.apiUrl}/retrieve-cart-deposit?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  getOrderCartDeposit(idOrder: number): Observable<{ product: any }> {
    return this.http.get<{ product: any }>(`${environment.apiUrl}/retrieve-cart-deposit/${idOrder}`, { withCredentials: true });
  }


  getOrderDetail(idInvoice: number): Observable<{ product: any }> {
    return this.http.get<{ product: any }>(`${environment.apiUrl}/retrieve-detail-invoice/${idInvoice}`, { withCredentials: true });
  }


  postCreditNote(idInvoice: number, data: any): Observable<{ product: any }> {
    return this.http.post<{ product: any }>(`${environment.apiUrl}/credit-note/${idInvoice}`, data, { withCredentials: true });
  }


  postOrderCartDeposit(idOrder: number, data: any): Observable<{ product: any }> {
    return this.http.post<{ product: any }>(`${environment.apiUrl}/retrieve-cart-deposit/${idOrder}`, data, { withCredentials: true });
  }

  delOrderCartDeposit(idOrder: number) {
    return this.http.delete(`${environment.apiUrl}/retrieve-cart-deposit/${idOrder}`, { withCredentials: true });
  }

  getAllClients(page: number = 1, search: string = ''): Observable<{ clients: Client[] }> {
    const url = search
      ? `${environment.apiUrl}/get-create-client?page=${page}&search=${encodeURIComponent(search)}`
      : `${environment.apiUrl}/get-create-client?page=${page}`;
    return this.http.get<{ clients: Client[] }>(url, { withCredentials: true });
  }

  postClient(data: any): Observable<{ result: Client }> {
    return this.http.post<{ result: Client }>(`${environment.apiUrl}/get-create-client`, data, { withCredentials: true });
  }

  getOrderClient(idClient: number, startDate: string = 'at', endDate: string = 'az'): Observable<{ result: any[] }> {
    return this.http.get<{ result: any[] }>(`${environment.apiUrl}/retrieve-orders/${idClient}?page=1
      &startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      { withCredentials: true });
  }

  editClient(idClient: number, data: any): Observable<{ result: Client }> {
    return this.http.put<{ result: Client }>(`${environment.apiUrl}/retrieve-orders/${idClient}`, data, { withCredentials: true });
  }

  deleteClient(idClient: number): Observable<{ result: Client }> {
    return this.http.delete<{ result: Client }>(`${environment.apiUrl}/retrieve-orders/${idClient}`, { withCredentials: true });
  }

  getOrderExchang(): Observable<{ result: any }> {
    return this.http.get<{ result: any }>(`${environment.apiUrl}/save-order-exchange`, { withCredentials: true });
  }

  postProductForOrderExchang(data: any): Observable<{ result: any }> { //to register product exchange
    return this.http.post<{ result: any }>(`${environment.apiUrl}/save-order-exchange`, data, { withCredentials: true });
  }

  deleteProductForOrderExchang(): Observable<{ result: any }> {
    return this.http.delete<{ result: any }>(`${environment.apiUrl}/save-order-exchange`, { withCredentials: true });
  }

  getStatClient(idClient: number): Observable<{ result: any }> {
    return this.http.get<{ result: any }>(`${environment.apiUrl}/stat-client-amount/${idClient}`, { withCredentials: true });
  }

  getUniqueInvoice(nameInvoice: string): Observable<{ result: Orders }> {
    return this.http.get<{ result: Orders }>(`${environment.apiUrl}/get-unique-invoice/${nameInvoice}`, { withCredentials: true });
  }
}


