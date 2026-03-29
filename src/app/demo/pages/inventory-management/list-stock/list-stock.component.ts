/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColumnConfig, ProductWhStore, Warehouse } from 'src/app/interfaces/global';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { getDateString, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { ColumnsSelectedComponent } from "src/app/demo/application/reusableComponents/columns-selected/columns-selected.component";
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map, Observable } from 'rxjs';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { PublicService } from 'src/app/services/public.service';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';

@Component({
  selector: 'app-list-stock',
  standalone: true,
  imports: [SharedModule, SearchListComponent, ColumnsSelectedComponent, SpinnersComponent, SetPaginationComponent, SelectedComponent, SubmitSpinnerComponent],
  templateUrl: './list-stock.component.html',
  styleUrl: './list-stock.component.scss'
})
export class ListStockComponent implements OnInit {
  @ViewChild('modalTransfertProd') modalElement!: ElementRef;
  columns: ColumnConfig[] = [
    { key: 'product', label: 'Article', visible: true },
    { key: 'refStock', label: 'Référence stock', visible: true },
    { key: 'quantity', label: 'Quantité', visible: true },
    { key: 'sellPrice', label: 'Prix de vente', visible: true },
    { key: 'expireDate', label: "Date d'expiration", visible: true },
    { key: 'actions', label: 'Action', visible: true }
  ];
  all_stock: ProductWhStore[] = [];
  searchTerm: string = '';
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  the_date: string = ''
  errors: any = [];
  detailProd: any = {
    name: '',
    referenceStock: '',
    quantity: 0,
    quanty: 0,
  };
  loadingDetail: boolean = false
  loading: boolean = false
  searchTermWhStor: string = ''; // to search warehouse/store for transfert item
  all_warehouses_stores: Warehouse[] = [];
  idWHStore: number = 0; // For transfert item
  itemsToTransfert: any[] = [];
  setSellingPrice: boolean = false
  sellingPricing: number = 0
  lotSelected!: any
  devise: string = ''
  titleModal: string = ''
  defectiveItem: boolean = false
  setBadge: string = 'expired'
  loadingTransf: boolean = false
  paginationTransf: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pagesTransf: number[] = [];
  isSaving: boolean = false

  constructor(private stockMvtService: StockMvtService, private columnVisibility: ColumnsVisibilityService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.the_date = getDateString()
    this.columnVisibility.setColumns(this.columns); //call the service
    this.fetchStockWhStore(1);
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });

  }

  // Stock pagination/search
  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchStockWhStore(1);
  }


  fetchStockWhStore(page: number = 1) {
    this.loading = true;
    setPagination(
      this.stockMvtService.getStockForWhStor.bind(this.stockMvtService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.all_stock = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.loading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchStockWhStore(page);
  }

  // ******************************* About to show or hide column *******************************
  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  isColumnVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }

  getDetailOfProductFromBackend(item: ProductWhStore) {
    this.stockMvtService.getDetailProdInstor(item.id).subscribe({
      next: (res) => {
        this.detailProd = {
          name: res?.stockWhStore?.product?.name ?? 'N/A',
          referenceStock: item?.stockWhStore?.indiceStock ?? '',
          quantity: item?.quantity ?? 0,
          quanty: 0, // Consider renaming this if it's a typo
        };
      },
      error: (err) => {
        this.errors = ['Failed to load product details.'];
        console.error(err);
      },
      complete: () => {
        this.loadingDetail = false;
      }
    });
  }

  getDetailOfProduct(item: ProductWhStore): void {
    this.titleModal = "Article à transférer"
    this.defectiveItem = false
    this.errors = []
    this.setSellingPrice = false
    if (!item?.id) {
      this.errors = ['Invalid product item.'];
      return;
    }

    this.loadingDetail = true;
    this.errors = [];
    this.getDetailOfProductFromBackend(item)
  }

  setSellPrice(item: ProductWhStore): void {
    this.titleModal = "Définir le prix de vente"
    this.defectiveItem = false
    this.lotSelected = item
    this.sellingPricing = item?.sellPrice || 0
    this.getDetailOfProductFromBackend(item)
    this.setSellingPrice = true
    this.errors = []
  }

  reportDefectiveItems(itemStock: ProductWhStore) {
    this.titleModal = "Déclarer les articles comme non utilisables"
    this.lotSelected = itemStock
    this.defectiveItem = true
    this.errors = []
    this.getDetailOfProductFromBackend(itemStock)
  }


  // Show modal to add item to transfert
  showModalAddItemTransfert() {
    this.errors = [];
    this.idWHStore = 0; // Reset warehouse/store ID
    this.searchTermWhStor = ''; // Reset search term for warehouse/store
    this.all_warehouses_stores = [];
    this.fetchProductsTransfert(1)
  }


  fetchProductsTransfert(page: number = 1) {
    this.loadingTransf = true;
    setPagination(
      this.stockMvtService.getItemTransfert.bind(this.stockMvtService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      '',
      // this.searchTermStock,
      (data: any) => {
        this.paginationTransf = data;
        this.itemsToTransfert = data?.listItems
        this.pagesTransf = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.loadingTransf = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }


  onPageChangeTransf(page: number) {
    this.fetchProductsTransfert(page);
  }


  addItemToTransfert() { //créer une nouvelle fonction pour gérer les transfert à partir des boutiques ou autres wh
    this.isSaving = true
    this.stockMvtService.postItemTransfert(this.detailProd).subscribe({
      next: () => {
        toastShow('success', "✅ Article ajouté au transfert");
        const closeBtn = document.getElementById('closeModalAddItem');
        this.isSaving = false
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
      }
    })
  }

  setTheSellingPrice() {
    this.isSaving = true
    const data = { sellingPrice: this.sellingPricing }
    this.stockMvtService.postSellPrice(this.lotSelected?.stockWhStore?.id, data).subscribe({
      next: () => {
        this.isSaving = false
        this.fetchStockWhStore(1)
        toastShow("success", "Prix de vente défini")
        const closeBtn = document.getElementById('closeModalAddItem');
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
      }
    })
  }

  validDefectiveItem() {
    this.isSaving = true
    const data = { quantity: this.detailProd?.quanty, t_badge: this.setBadge }
    this.stockMvtService.postDefectiveProduct(this.lotSelected?.stockWhStore?.id, data).subscribe({
      next: (res: any) => {
        this.all_stock = this.all_stock.filter(item => item?.stockWhStore?.id !== this.lotSelected?.stockWhStore?.id);
        this.all_stock?.unshift(res?.result)
        toastShow("success", "✅ Article mis en rébut")
        this.isSaving = false
        const closeBtn = document.getElementById('closeModalAddItem');
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
      }
    })
  }

  //********************************** About retrieve store and warehouse **********************************
  fetchWhStore() {
    this.stockMvtService.getWarehousesTransfert(this.searchTermWhStor).subscribe({
      next: (data: any) => {
        this.all_warehouses_stores = data?.result || [];
      }
    });
  }

  // Search and select warehouse/store for item transfert
  searchWhStore(term: string) {
    this.searchTermWhStor = term;
    this.fetchWhStore(); // or whatever logic you use
    if (!term) {
      this.idWHStore = 0; // Reset the warehouse/store ID if no term is entered
    }
  }

  selectWhStore(event: any) {
    if (event?.nameWh && event.nameWh !== this.searchTermWhStor) {
      this.searchTermWhStor = event.nameWh;
      this.idWHStore = event?.id;
    }
  }

  // ************************************* About transfert item *************************************
  confirmTransfertItem() {
    this.isSaving = true
    const transfertData = {
      idWHStore: this.idWHStore
    }
    this.stockMvtService.postConfirmItemTransfert(transfertData).subscribe({
      next: () => {
        this.fetchStockWhStore(1);
        this.itemsToTransfert = [];
        this.idWHStore = 0; // Reset warehouse/store ID after confirmation
        toastShow('success', "✅ Transfert d'articles confirmé");
        this.isSaving = false
        const closeBtn = document.getElementById('closeModalTransfert001');
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalTransfert001'));
      }
    });
  }

  deleteItemToTransfert(idTransfert: number) {
    this.stockMvtService.deleteItemTransfert(idTransfert).subscribe({
      next: () => {
        this.fetchProductsTransfert(1)
        toastShow('success', "✅ Article supprimé du transfert");
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeSubCat05'));
      }
    });
  }


  //*************************************** About export //***************************************
  // --- Export helpers ---
  getExportRows(data: ProductWhStore[], columns: ColumnConfig[]) {
    return data.map(lot => columns.map(col => {
      switch (col.key) {
        case 'product': return lot?.stockWhStore?.product?.name || '';
        case 'refStock': return lot?.stockWhStore?.indiceStock ?? '';
        case 'quantity': return lot?.quantity ?? '';
        case 'sellPrice': return lot?.sellPrice ?? '' + this.devise;
        case 'expireDate': return lot?.stockWhStore?.expDate ? new Date(lot?.stockWhStore?.expDate).toLocaleDateString() : '';
        default: return '';
      }
    }));
  }


  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.stockMvtService.getStockForWhStor(1, term, false).pipe(
            map((res: { results: ProductWhStore[] }) => res?.results)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'Stock_'
    });
  }

  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.stockMvtService.getStockForWhStor(1, searchTerm, false).pipe(
          map((res: { results: ProductWhStore[] }) => res?.results)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export de stock",
      nameFile: "export_stock"
    });
  }


  clickOutsideModalAddItem() {
    this.all_warehouses_stores = [];
  }

}
