/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Category, Product, Promotion, Provider, StockMvt, SubCategory, TypeReward } from '../interfaces/global';

@Injectable({
  providedIn: 'root'
})
export class ArticleManagementService {

  constructor(private http: HttpClient) { }

  getCategory(page: number = 1, search: string = ''): Observable<{ result: Category[] }> {
    const url = search
      ? `${environment.apiUrl}/register-get-categories?page=${page}&search=${encodeURIComponent(search)}`
      : `${environment.apiUrl}/register-get-categories?page=${page}`;
    return this.http.get<{ result: Category[] }>(url, { withCredentials: true });
  }

  getSubCatBasedCat(category_id: number, search: string) {
    const params: string[] = [];
    params.push(`search=${search}`);
    const queryString = params.join('&');
    return this.http.get(`${environment.apiUrl}/subcategory-based-category/${category_id}/?${queryString}`, { withCredentials: true })
  }

  postCategory(data: any) {
    return this.http.post(`${environment.apiUrl}/register-get-categories`, data, { withCredentials: true });
  }

  putCategory(idCat: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-delete-category/${idCat}`, data, { withCredentials: true });
  }

  deleteCategory(idCat: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-category/${idCat}`, { withCredentials: true });
  }

  getSubCategorys() {
    return this.http.get(`${environment.apiUrl}/register-get-subcategories`, { withCredentials: true });
  }

  getSubCategory(page: number = 1, search: string = ''): Observable<{ result: SubCategory[] }> {
    const url = search
      ? `${environment.apiUrl}/register-get-subcategories?page=${page}&search=${encodeURIComponent(search)}`
      : `${environment.apiUrl}/register-get-subcategories?page=${page}`;
    return this.http.get<{ result: SubCategory[] }>(url, { withCredentials: true });
  }

  postSubCategory(data: any) {
    return this.http.post(`${environment.apiUrl}/register-get-subcategories`, data, { withCredentials: true });
  }

  putSubCategory(idSubCat: number, data: any) {
    return this.http.put(`${environment.apiUrl}/edit-delete-subcategory/${idSubCat}`, data, { withCredentials: true });
  }

  deleteSubCategory(idSubCat: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-subcategory/${idSubCat}`, { withCredentials: true });
  }

  getOneProvider(): Observable<{ result: Provider }> {
    return this.http.get<{ result: Provider }>(`${environment.apiUrl}/register-one-provider`, { withCredentials: true })
  }

  getProvider(page: number = 1, search: string = ''): Observable<{ providers: Provider[] }> {
    const url = search
      ? `${environment.apiUrl}/register-get-provider?page=${page}&search=${encodeURIComponent(search)}`
      : `${environment.apiUrl}/register-get-provider?page=${page}`;
    return this.http.get<{ providers: Provider[] }>(url, { withCredentials: true });
  }

  postProvider(data: Provider): Observable<{ result: boolean }> {
    return this.http.post<{ result: boolean }>(`${environment.apiUrl}/register-get-provider`, data, { withCredentials: true }
    );
  }

  putProvider(idProvider: number, data: any): Observable<{ provider: Provider }> {
    return this.http.put<{ provider: Provider }>(`${environment.apiUrl}/edit-delete-provider/${idProvider}`, data, { withCredentials: true });
  }

  deleteProvider(idProvider: number) {
    return this.http.delete(`${environment.apiUrl}/edit-delete-provider/${idProvider}`, { withCredentials: true });
  }

  postProduct(data: any): Observable<{ result: boolean }> { //to register product
    return this.http.post<{ result: boolean }>(`${environment.apiUrl}/register-product`, data, { withCredentials: true });
  }

  putProduct(idProduct: number, data: any): Observable<{ product: Product }> { //to register product
    return this.http.put<{ product: Product }>(`${environment.apiUrl}/edit-product/${idProduct}`, data, { withCredentials: true });
  }

  deleteProduct(idProduct: number) { //to register product
    return this.http.delete(`${environment.apiUrl}/edit-product/${idProduct}`, { withCredentials: true });
  }

  getAllProducts(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-products?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-products?page=${page}`, { withCredentials: true });
    }
  }

  getAllIndicesStoks(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-all-stocks?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-all-stocks?page=${page}`, { withCredentials: true });
    }
  }


  getProductsInWarehouses(page: number = 1, search: string = ''): Observable<{ results: StockMvt[] }> { //get products in warehouse with the quantity
    if (search) {
      return this.http.get<{ results: StockMvt[] }>(`${environment.apiUrl}/get-product-warehouse?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: StockMvt[] }>(`${environment.apiUrl}/get-product-warehouse?page=${page}`, { withCredentials: true });
    }
  }


  getProductsInWarehouse(page: number = 1, search: any = '', pagination: boolean = true, whStoreId: any): Observable<{ results: Product[] }> {
    const params: string[] = [];
    params.push(`page=${page}`);
    params.push(`pagination=${pagination}`);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }

    if (whStoreId) {
      params.push(`wh_store=${encodeURIComponent(whStoreId)}`);
    }

    const queryString = params.join('&');

    return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/get-product-warehouse?${queryString}`, { withCredentials: true });
  }

  getAllProductsFromStock(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-product-promotions?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-product-promotions?page=${page}`, { withCredentials: true });
    }
  }

  getAllWhStoresFromStock(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-warehouse-promotions?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-warehouse-promotions?page=${page}`, { withCredentials: true });
    }
  }

  postPromotion(data: any): Observable<{ result: boolean }> {
    return this.http.post<{ result: boolean }>(`${environment.apiUrl}/get-create-promotions`, data, { withCredentials: true }
    );
  }

  getPromotions(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-create-promotions?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-create-promotions?page=${page}`, { withCredentials: true });
    }
  }

  deletePromotion(idProduct: number) { //to register product
    return this.http.delete(`${environment.apiUrl}/delete-edit-promotions/${idProduct}`, { withCredentials: true });
  }

  editPromotion(idProduct: number, data: any) { //to register product
    return this.http.put(`${environment.apiUrl}/delete-edit-promotions/${idProduct}`, data, { withCredentials: true });
  }

  getAllClients(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-clients?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/retrive-clients?page=${page}`, { withCredentials: true });
    }
  }

  postDiscount(data: any): Observable<{ result: Promotion[] }> {
    return this.http.post<{ result: Promotion[] }>(`${environment.apiUrl}/get-create-discount`, data, { withCredentials: true }
    );
  }

  getDiscounts(page: number = 1, search: string = ''): Observable<{ results: Product[] }> {
    if (search) {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/get-create-discount?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: Product[] }>(`${environment.apiUrl}/get-create-discount?page=${page}`, { withCredentials: true });
    }
  }

  deleteDiscount(idProduct: number) { //to register product
    return this.http.delete(`${environment.apiUrl}/delete-edit-discount/${idProduct}`, { withCredentials: true });
  }

  getSettingPromotion(): Observable<{ result: TypeReward[] }> {
    return this.http.get<{ result: TypeReward[] }>(`${environment.apiUrl}/post-setting-promotion`, { withCredentials: true });
  }


  postSettingPromotion(data: any): Observable<{ result: boolean }> {
    return this.http.post<{ result: boolean }>(`${environment.apiUrl}/post-setting-promotion`, data, { withCredentials: true });
  }


  putSettingPromotion(idRw: number, data: any): Observable<{ result: TypeReward }> {
    return this.http.put<{ result: TypeReward }>(`${environment.apiUrl}/put-setting-promotion/${idRw}/`, data, { withCredentials: true });
  }


  getClientRewarded(page: number = 1, search: string = '', idRw: number = 0): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/retrieve-clients-rewarded/${idRw}/?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/retrieve-clients-rewarded/${idRw}/?page=${page}`, { withCredentials: true });
    }
  }


  putSetDiscount(idClient: number, data: any): Observable<{ result: boolean }> {
    return this.http.put<{ result: boolean }>(`${environment.apiUrl}/set-discount/${idClient}`, data, { withCredentials: true });
  }


  postAdvertising(data: any): Observable<{ result: any }> {
    return this.http.post<{ result: any }>(`${environment.apiUrl}/get-post-advertising`, data, { withCredentials: true });
  }

  getAdvertising(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-post-advertising?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-post-advertising?page=${page}`, { withCredentials: true });
    }
  }

  getClientAdvertising(page: number = 1, search: string = ''): Observable<{ results: any[] }> {
    if (search) {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-client-advertising?page=${page}&search=${encodeURIComponent(search)}`, { withCredentials: true });
    } else {
      return this.http.get<{ results: any[] }>(`${environment.apiUrl}/get-client-advertising?page=${page}`, { withCredentials: true });
    }
  }

  postSendAdvertising(data: any): Observable<{ result: any }> {
    return this.http.post<{ result: any }>(`${environment.apiUrl}/send-advertising`, data, { withCredentials: true });
  }

}

