/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';
import { getDateString, setPagination, setPaginationStockMvt, showError, toastShow } from 'src/app/share/shared';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { SubmitSpinnerComponent } from "src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component";
import { firstValueFrom, map, Observable } from 'rxjs';
import { AdjustStock, ColumnConfig, Warehouse } from 'src/app/interfaces/global';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { PublicService } from 'src/app/services/public.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { SetPaginationComponent } from 'src/app/demo/application/reusableComponents/set-pagination/set-pagination.component';
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';

@Component({
  selector: 'app-adjust-stock',
  standalone: true,
  imports: [SelectedComponent, SharedModule, SubmitSpinnerComponent, SpinnersComponent, SearchListComponent, SetPaginationComponent],
  templateUrl: './adjust-stock.component.html',
  styleUrl: './adjust-stock.component.scss'
})
export class AdjustStockComponent implements OnInit {

  isLoading: boolean = false
  errors: any = []
  searchTerm: string = ""
  all_products: any[] = []
  allAdjustStocks: AdjustStock[] = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  isSaving: boolean = false;
  loading: boolean = false;
  formAdjustQty!: FormGroup
  productDetail: any = { name: '', actualQty: 0 };
  startDate: string = ''
  endDate: string = ''
  selectWhShop: number = 0
  userHasPermission: boolean = true
  userHasPermissionToView: boolean = true
  permissions: string[] = [];
  role: string = ''
  warehouses: Warehouse[] = []
  isLoadingProd: boolean = false
  searchTermStock: string = ''
  the_date: string = ''
  columns: ColumnConfig[] = [
    { key: 'date', label: "Date", visible: true },
    { key: 'user', label: "Utilisateur", visible: true },
    { key: 'pos', label: 'Point de vente', visible: true },
    { key: 'product', label: 'Article', visible: true },
    { key: 'qtyBefore', label: 'Quantité avant', visible: true },
    { key: 'qtyAfter', label: 'Quantité après', visible: true },
    { key: 'typeAdj', label: 'Type d\'ajustement', visible: true },
    { key: 'qtyAdjust', label: 'Quantité ajustée', visible: true },
    { key: 'reason', label: 'Motif', visible: true }
  ];

  constructor(private storeService: StoreService, private fb: FormBuilder, private stockMvtService: StockMvtService,
    private authService: AuthService, private publicService: PublicService, private columnVisibility: ColumnsVisibilityService) { }

  ngOnInit(): void {
    this.columnVisibility.setColumns(this.columns); //call the service
    this.the_date = getDateString()
    this.role = this.authService.getRole?.role
    this.authService.getPermissions().subscribe({
      next: (res: any) => {
        this.permissions = res?.result ?? [];
        this.userHasPermission = this.permissions.includes('adjust_stock');
        this.userHasPermissionToView = this.permissions.includes('view_adjustments_stock');

        if (this.role === 'Admin' || this.userHasPermissionToView) {
          this.publicService.getWarehouseStore().subscribe({
            next: (res: { result: Warehouse[] }) => {
              this.warehouses = res?.result;
            }
          });
        }
      },
      error: err => {
        console.error("❌ Failed to load permissions:", err);
      }
    });

    this.formAdjustQty = this.fb.group({
      idStock: 0,
      qtyAdjust: 0,
      reason: '',
      lotStock: 0,
      adjustmentType: 0
    })
    this.fetchStockAdjustement(1)
  }

  get displayProductFn() {
    return (product: any) => {
      if (['siteAdmin', 'Admin'].includes(this.role)) {
        return product?.indiceStock ?? '';
      }
      return product?.stockWhStore?.indiceStock ?? '';
    };
  }


  isColumnVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }


  fetchStockAdjustement(page: number = 1) {
    this.isLoading = true;
    setPaginationStockMvt(
      this.stockMvtService.getAdjustStock.bind(this.stockMvtService) as (page: number, searchTermStock: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTermStock,
      (data: any) => {
        this.pagination = data;
        this.allAdjustStocks = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      this.startDate,
      this.endDate,
      this.selectWhShop
    );
  }


  onSearchChangeStock(term: string) {
    this.searchTermStock = term;
    this.fetchStockAdjustement(1);
  }

  onPageChange(page: number) {
    this.fetchStockAdjustement(page);
  }


  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchStockAdjustement(1);
  }

  filterByWhStore() {
    this.fetchStockAdjustement(1)
  }


  fetchProducts(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoadingProd = true
    setPagination(this.storeService.getProductsForStore.bind(this.storeService), page, this.searchTerm, (data: any) => {
      this.all_products = data?.listItems;
      this.isLoadingProd = false
    })
  }


  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // or whatever logic you use
  }


  selectProduct(produ: any): void {
    if (!produ || !produ.id) return;

    const isAdmin = ['siteAdmin', 'Admin'].includes(this.role ?? '');
    const indiceStock = isAdmin ? produ?.indiceStock : produ?.stockWhStore?.indiceStock;
    const productName = isAdmin ? produ?.product?.name : produ?.stockWhStore?.product?.name;

    // if (productName && indiceStock && indiceStock !== this.searchTerm) {
    // Valeur affichée dans l'autocomplete
    this.searchTerm = indiceStock;

    // Informations affichées à l'utilisateur
    this.productDetail = {
      name: productName,
      actualQty: produ?.quantity
    };

    // Valeurs envoyées au backend
    this.formAdjustQty.patchValue({
      idStock: produ?.id,
      lotStock: indiceStock
    });
    // }
  }

  submitAdjustment() {
    const btnModal = document.getElementById('closeModalStock02');
    this.isSaving = true;
    this.stockMvtService.postAdjustStock(this.formAdjustQty.value.idStock, this.formAdjustQty.value).subscribe({
      next: () => {
        toastShow('success', "✅ Stock enregistré avec succès");
        this.isSaving = false;
        this.formAdjustQty = this.fb.group({
          idStock: 0,
          qtyAdjust: 0,
          reason: '',
          lotStock: 0,
          adjustmentType: 0
        })
        this.errors = [];
        this.fetchStockAdjustement(1);
        btnModal?.click(); // Close modal after successful submission
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalStock'));
      }
    })
  }


  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.stockMvtService.getAdjustStock(1, term, this.startDate, this.endDate, this.selectWhShop, false).pipe(
            map((res: { results: any[] }) => res?.results)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'Adjust_'
    });
  }


  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.stockMvtService.getAdjustStock(1, searchTerm, this.startDate, this.endDate, this.selectWhShop, false).pipe(
          map((res: { results: any[] }) => res?.results)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export de stock",
      nameFile: "Adjust_"
    });
  }


  getExportRows(data: any[], columns: ColumnConfig[]) {
    return data.map(adjustStock => columns.map(col => {
      switch (col.key) {
        case 'date': return adjustStock?.created_at ? new Date(adjustStock?.created_at).toLocaleDateString() : '';
        case 'user': return (adjustStock?.user?.email) || '';
        case 'pos': return adjustStock?.warehouse?.nameWh ?? '';
        case 'product': return adjustStock?.lotWhStock?.product?.name ?? '';
        case 'qtyBefore': return adjustStock?.quantity_before ?? '';
        case 'qtyAfter': return adjustStock?.quantity_after ?? '';
        case 'typeAdj': return adjustStock?.type_adjust ?? '';
        case 'qtyAdjust': return adjustStock?.quantity_diff ?? '';
        case 'reason': return adjustStock?.reason ?? '';
        default: return '';
      }
    }));
  }


  clickOutside() {
    this.all_products = [];
  }

}
