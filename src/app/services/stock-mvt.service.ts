/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { MovementStock, Product, ProductWhStore, StockMvt, TrashProd, Warehouse } from '../interfaces/global';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockMvtService {

  constructor(private http: HttpClient) { }

  getStockIn(page: number = 1, search: any = '', pagination: boolean = true): Observable<{ result: StockMvt[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    const queryString = params.join('&');
    return this.http.get<{ result: StockMvt[] }>(`${environment.apiUrl}/post-get-stock?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  getStockInValidate(page: number = 1, search: any = '', pagination: boolean = true): Observable<{ results: StockMvt[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: StockMvt[] }>(`${environment.apiUrl}/post-get-stock-validate?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }

  getTrashValidate(page: number = 1, search: any = '', order_by: any = '', pagination: boolean = true): Observable<{ results: StockMvt[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (order_by) {
      params.push(`order_by=${encodeURIComponent(order_by)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: StockMvt[] }>(`${environment.apiUrl}/post-get-trash-validate?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }

  postTrashValidate(data: TrashProd): Observable<{ result: TrashProd }> {
    return this.http.post<{ result: TrashProd }>(`${environment.apiUrl}/post-get-trash-validate`, data, { withCredentials: true }
    );
  }

  postStockIn(data: StockMvt): Observable<{ result: boolean }> {
    return this.http.post<{ result: boolean }>(`${environment.apiUrl}/post-get-stock`, data, { withCredentials: true }
    );
  }

  putValidStock(idStock: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-stock-validate/${idStock}`, data, { withCredentials: true }
    );
  }

  deleteStock(idStock: number) {
    return this.http.delete(`${environment.apiUrl}/delete-stock/${idStock}`, { withCredentials: true }
    );
  }

  getDetailProd(idProduct: number): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${environment.apiUrl}/retrieve-detail-product/${idProduct}`, { withCredentials: true }
    );
  }

  getStockInvoice(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/register-stock-using-invoice?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/register-stock-using-invoice?page=${page}`, { withCredentials: true });
    }
  }

  postStockInvoice(data: any) {
    return this.http.post(`${environment.apiUrl}/register-stock-using-invoice`, data, { withCredentials: true }
    );
  }

  getDeposit(idInvoice: string) {
    return this.http.get(`${environment.apiUrl}/deposit-invoice/${idInvoice}`, { withCredentials: true }
    );
  }

  putDeposit(idInvoice: string, data: any) {
    return this.http.put(`${environment.apiUrl}/deposit-invoice/${idInvoice}`, data, { withCredentials: true }
    );
  }

  deleteInvoice(nberInvoice: string, data: any) {
    return this.http.delete(`${environment.apiUrl}/deposit-invoice/${nberInvoice}`, { body: data, withCredentials: true }
    );
  }

  deleteDeposit(idDeposit: string) {
    return this.http.delete(`${environment.apiUrl}/delete-deposit/${idDeposit}`, { withCredentials: true }
    );
  }


  getWarehousesTransfert(search: string) {
    const params: string[] = [];
    if (search) {
      params.push(`search=${search}`);
    }
    const queryString = params.join('&');
    return this.http.get<{ result: Warehouse[] }>(`${environment.apiUrl}/retrieve-warehouse-transfert/?${queryString}`, { withCredentials: true });
  }

  getItemTransfert(page: number = 1) {
    const params: string[] = [];
    params.push(`page=${page}`);
    const queryString = params.join('&');
    return this.http.get<{ results: any[] }>(`${environment.apiUrl}/add-items-transfert?${queryString}`, { withCredentials: true });
  }


  postItemTransfert(data: any) {
    return this.http.post(`${environment.apiUrl}/add-items-transfert`, data, { withCredentials: true }
    );
  }


  deleteItemTransfert(idTransfert: number) {
    return this.http.delete(`${environment.apiUrl}/delete-item-transfert/${idTransfert}`, { withCredentials: true }
    );
  }


  postConfirmItemTransfert(data: any) {
    return this.http.post(`${environment.apiUrl}/confirm-items-transfert`, data, { withCredentials: true }
    );
  }


  getConfirmItemTransfert(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/confirm-items-transfert?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/confirm-items-transfert?page=${page}`, { withCredentials: true });
    }
  }


  getItemForValidation(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/list-product-validation?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/list-product-validation?page=${page}`, { withCredentials: true });
    }
  }


  getAllItemForValidation(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-all-validation-items?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-all-validation-items?page=${page}`, { withCredentials: true });
    }
  }


  postConfirmTheTransfert(data: any, idTransfert: number) {
    return this.http.post(`${environment.apiUrl}/valid-transfert-product/${idTransfert}`, data, { withCredentials: true }
    );
  }


  deleteConfirmTheTransfert(idTransfert: number) {
    return this.http.delete(`${environment.apiUrl}/valid-transfert-product/${idTransfert}`, { withCredentials: true }
    );
  }


  getStockForWhStor(page: number = 1, search: any = '', pagination: boolean = true): Observable<{ results: ProductWhStore[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: ProductWhStore[] }>(`${environment.apiUrl}/retrieve-stock-warehouse-store?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  getStockMovement(page: number = 1, search: any = '', startDate?: string, endDate?: string, typeOfMvt?: any, pagination: boolean = true): Observable<{ results: MovementStock[] }> {
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
    if (typeOfMvt) {
      params.push(`typeOfMvt=${encodeURIComponent(typeOfMvt)}`);
    }

    const queryString = params.join('&');
    return this.http.get<{ results: MovementStock[] }>(`${environment.apiUrl}/retrieve-stock-movement?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  getDetailProdInstor(idProduct: number): Observable<ProductWhStore> {
    return this.http.get<ProductWhStore>(`${environment.apiUrl}/detail-product-store/${idProduct}`, { withCredentials: true }
    );
  }


  postSellPrice(idProduct: number, data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/set-selling-price/${idProduct}`, data, { withCredentials: true }
    );
  }


  getCumStock(data: any, checkingUrl: boolean): Observable<any> {
    // const params = new HttpParams({ fromObject: data });
    const params = new HttpParams({ fromObject: { ...data, checkingUrl } });
    return this.http.get<any>(`${environment.apiUrl}/cummul-stock`, { withCredentials: true, params }
    );
  }

  getDefectiveProducdt(page: number = 1, search: any = '', pagination: boolean = true): Observable<{ results: ProductWhStore[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: ProductWhStore[] }>(`${environment.apiUrl}/set-defective-product/O?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }

  getDefectiveProduct(page: number = 1, search: any = '', startDate?: string, endDate?: string, selectWhShop?: number, pagination: boolean = true): Observable<{ results: MovementStock[] }> {
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
      params.push(`idWhStore=${encodeURIComponent(selectWhShop)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: MovementStock[] }>(`${environment.apiUrl}/set-defective-product/O?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }

  postDefectiveProduct(idProduct: number, data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/set-defective-product/${idProduct}`, data, { withCredentials: true }
    );
  }


  deleteDefectiveProduct(idTrashProduct: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/set-defective-product/${idTrashProduct}`, { withCredentials: true }
    );
  }


  getAdjustStock(page: number = 1, search: any = '', startDate?: string, endDate?: string, selectWhShop?: number, pagination: boolean = true): Observable<{ results: MovementStock[] }> {
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
      params.push(`idWhStore=${encodeURIComponent(selectWhShop)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: MovementStock[] }>(`${environment.apiUrl}/adjust-stock/O?${queryString}&pagination=${pagination}`, { withCredentials: true });
  }


  postAdjustStock(idStock: number, data: any) {
    return this.http.post(`${environment.apiUrl}/adjust-stock/${idStock}`, data, { withCredentials: true }
    );
  }

}



