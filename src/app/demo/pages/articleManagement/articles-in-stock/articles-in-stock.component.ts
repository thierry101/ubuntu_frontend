/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Product, Warehouse } from 'src/app/interfaces/global';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { getDateString, setPagination, showError } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SearchListComponent } from "../../../application/reusableComponents/search-list/search-list.component";
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import { ColumnsSelectedComponent } from 'src/app/demo/application/reusableComponents/columns-selected/columns-selected.component';
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map, Observable } from 'rxjs';
import { PublicService } from 'src/app/services/public.service';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-articles-in-stock',
  standalone: true,
  imports: [SharedModule, SearchListComponent, SetPaginationComponent, ColumnsSelectedComponent, SpinnersComponent],
  templateUrl: './articles-in-stock.component.html',
  styleUrl: './articles-in-stock.component.scss'
})
export class ArticlesInStockComponent implements OnInit {
  searchTerm: string = ''
  role: string = '';
  userInfo: any;
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  warehouses: Warehouse[] = []
  all_products: Product[] = []
  permissions: string[] = [];
  the_date: string = ''
  nameWhStore: string | undefined = ''
  idWhStoreSelected: number = 0
  errors: any = []
  isLoading: boolean = true
  userHasPermission: boolean = true
  columns = [
    { key: 'category', label: 'Catégorie', visible: true },
    { key: 'subCategory', label: 'Sous-catégorie', visible: true },
    { key: 'name', label: 'Désignation', visible: true },
    { key: 'total_quantity', label: 'Quantité', visible: true },
    { key: 'quantityWarning', label: 'Quantité alerte', visible: true },
  ];

  constructor(private articleManagementService: ArticleManagementService, private columnVisibility: ColumnsVisibilityService,
    private publicService: PublicService, private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.the_date = getDateString()
    this.userInfo = this.authService.currentUser;
    this.role = this.userInfo?.role;
    this.fetchProducts(1)
    this.columnVisibility.setColumns(this.columns); //call the service
    this.publicService.getWarehousesStores().subscribe({
      next: (res: { result: Warehouse[] }) => {
        this.warehouses = res?.result;
        this.isLoading = false;
      }
    });
    this.permissions = this.authService.currentPermissions || [];
    this.userHasPermission = this.permissions.includes('watch_stock')
  }

  // ******************************* About retrieve article, pagination and search  *******************************
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // reset to first page on search
  }

  fetchProducts(page: number = 1) {

    this.isLoading = true;
    setPagination(
      this.articleManagementService.getProductsInWarehouse.bind(this.articleManagementService) as
      (page: number, searchTerm: any, startDate?: any, endDate?: string) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.all_products = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.errors = []

        this.isLoading = false;
      },
      true,
      this.idWhStoreSelected,
      (err: any) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchProducts(page);
  }

  filterStockInWhStore() {
    this.fetchProducts(1); // reset to first page on search
  }
  // ******************************* End retrieve article, pagination and search  *******************************

  // ******************************* About to show or hide column *******************************
  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  isVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }
  // ******************************* End About to show or hide column *******************************
  getNameWhStore() {
    const result = this.warehouses.find((whStor: Warehouse) => whStor?.id === Number(this.idWhStoreSelected));
    this.nameWhStore = result?.nameWh

  }

  // --- Export helpers ---
  getExportRows(data: Product[], columns: any[]) {
    return data.map(product => columns.map(col => {
      switch (col.key) { //the name inside each case must be the same in the columns
        case 'category': return product?.category?.name || '';
        case 'subCategory': return product?.subCategory?.name || '';
        case 'name': return product?.name || '';
        case 'total_quantity': return product?.total_quantity || 0;
        case 'quantityWarning': return product?.quantityWarning || 0;
        default: return '';
      }
    }));
  }


  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.articleManagementService.getProductsInWarehouse(1, searchTerm, false, this.idWhStoreSelected).pipe(
          map((res: { result: Product[] }) => res.result)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export de stock " + (this.nameWhStore || this.userInfo?.whStor),
      nameFile: "export_stock_" + (this.nameWhStore || this.userInfo?.whStor) + "_"
    });
  }


  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.articleManagementService.getProductsInWarehouse(1, term, false, this.idWhStoreSelected).pipe(
            map((res: { result: any[] }) => res.result)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'Stock_' + (this.nameWhStore || this.userInfo?.whStor) + "_"
    });
  }

  trackByProductId(index: number, product: any): number {
    return product?.id; // or any unique field
  }

}
