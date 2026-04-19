/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SearchListComponent } from "../../../application/reusableComponents/search-list/search-list.component";
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { PublicService } from 'src/app/services/public.service';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { convertAmount, formatPriceFr, getDateString, isMobileApp, playBeep, setPagination, showError, toastShow } from 'src/app/share/shared';
import { ColumnConfig, Product, Provider, StockMvt, Warehouse } from 'src/app/interfaces/global';
import { ColumnsSelectedComponent } from 'src/app/demo/application/reusableComponents/columns-selected/columns-selected.component';
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map, Observable } from 'rxjs';
import { SelectedComponent } from "../../../application/reusableComponents/selected/selected.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { DeleteConfirmModalComponent } from "src/app/demo/application/reusableComponents/delete-confirm-modal/delete-confirm-modal.component";
import JsBarcode from 'jsbarcode';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';
import { BarcodeScannerService } from 'android/services/barcode-scanner.service';

@Component({
  selector: 'app-stock-in',
  standalone: true,
  imports: [
    SharedModule,
    SearchListComponent,
    ImagePipe,
    SetPaginationComponent,
    ColumnsSelectedComponent,
    SelectedComponent, SpinnersComponent,
    DeleteConfirmModalComponent,
    SubmitSpinnerComponent
  ],
  templateUrl: './stock-in.component.html',
  styleUrl: './stock-in.component.scss'
})
export class StockInComponent implements OnInit {
  @ViewChild('barcodeCanvas') barcodeCanvas!: ElementRef<HTMLCanvasElement>;


  columns: ColumnConfig[] = [
    { key: 'product', label: 'Article', visible: true },
    { key: 'indiceStock', label: 'Référence stock', visible: true },
    { key: 'provider', label: 'Fournisseur', visible: true },
    { key: 'quantity', label: 'Quantité', visible: true },
    { key: 'created_at', label: "Date d'entrée", visible: true },
    { key: 'expDate', label: "Date d'expiration", visible: true },
    { key: 'purchase_price', label: 'Prix de revient', visible: true },
    { key: 'sell_price', label: 'Prix de vente', visible: true },
    { key: 'validStock', label: 'Statut', visible: true },
    { key: 'actions', label: 'Action', visible: true }
  ];

  searchTerm: string = ''; //to search product when registration stock
  searchTermStock: string = ''; // to search stock lot
  searchTermP: string = ''; // to search provider
  devise: string = '';
  wordCheck: string = '';
  reasonDel: string = '';
  searchTermWhStor: string = ''; // to search warehouse/store for transfert item
  id_lot = 0;
  all_products: Product[] = [];
  all_providers: Provider[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  paginationTransf: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  pagesTransf: number[] = [];
  all_stocks_lot: StockMvt[] = [];
  itemsToTransfert: any[] = [];
  all_warehouses_stores: Warehouse[] = [];
  errors: any = [];
  editProduct = false;
  isSaving = false;
  formProduct: FormGroup;
  idWHStore: number = 0; // For transfert item
  productDetail: any = { // For product selection
    reference: '',
    image: ''
  };
  detailProd: any = {
    name: '',
    referenceStock: '',
    quantity: 0,
    quanty: 0,
  };
  the_date: string = ''
  loading: boolean = false;
  setSellingPrice: boolean = false
  defectiveItem: boolean = false
  transfertItem: boolean = false
  lotSelected!: StockMvt
  sellingPricing: number = 0
  idLot: number = 0
  titleModal: string = ''
  setBadge: string = 'expired'
  valuePrint: string = ''
  isTransfert: boolean = false
  loadingTransf: boolean = false
  isMobileApp: boolean = false;

  constructor(
    private articleManagementService: ArticleManagementService, private columnVisibility: ColumnsVisibilityService,
    private fb: FormBuilder,
    private stockMvtService: StockMvtService,
    private publicService: PublicService, private scanner: BarcodeScannerService
  ) {
    this.formProduct = this.fb.group({
      product: 0,
      reference: '',
      provider: 0,
      quantity: 0,
      expDate: '',
      cost_price: 0,
      barCode: '',
      sellPrice: 0
    });
  }


  ngOnInit(): void {
    this.isMobileApp = isMobileApp
    this.the_date = getDateString()
    this.columnVisibility.setColumns(this.columns); //call the service
    this.fetchStockLot(1);
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
  }


  generateAndDownload(name: string, value: string) {
    if (!value) return;

    // Remplacer tous les espaces par des underscores
    const safeName = name.replace(/\s+/g, '_');

    // Génère le code-barres sur le canvas
    const canvas = this.barcodeCanvas.nativeElement;
    JsBarcode(canvas, value, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true
    });

    // Convertir en image et créer un lien pour télécharger
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}_${value}.png`; // nom du fichier sûr
      a.click();
      URL.revokeObjectURL(url); // libérer la mémoire
    });
  }


  // Stock pagination/search
  onSearchChangeStock(term: string) {
    this.searchTermStock = term;
    this.fetchStockLot(1);
  }

  fetchStockLot(page: number = 1) {
    this.loading = true;
    setPagination(
      this.stockMvtService.getStockIn.bind(this.stockMvtService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTermStock,
      (data: any) => {
        this.pagination = data;
        this.all_stocks_lot = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.loading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }


  onPageChange(page: number) {
    this.fetchStockLot(page);
  }

  saveInventory() {
    this.isSaving = true;
    this.stockMvtService.postStockIn(this.formProduct?.value).subscribe({
      next: () => {
        toastShow('success', "✅ Stock enregistré avec succès");
        this.fetchStockLot(1);
        const closeBtn = document.getElementById('closeModalStock');
        if (closeBtn) closeBtn.click();
        this.isSaving = false;
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalStock'));
      }
    });
  }


  getIdLot(idLot: number) {
    this.id_lot = idLot;
    this.wordCheck = '';
    this.errors = []
  }

  deleteStock() {
    this.stockMvtService.deleteStock(this.id_lot).subscribe({
      next: (res: any) => {
        this.all_stocks_lot = this.all_stocks_lot.filter((stock: any) => stock?.id !== this.id_lot); //quand on supprime le stock enregistré depuis la page entrée de stock
        this.all_stocks_lot = this.all_stocks_lot.filter(item => !res?.result.includes(item.id)); //quand on supprime les stocks enregistrés depuis enregistrer une facture. on aura une liste d'IDs à supprimer
        this.fetchStockLot(1);
        toastShow('success', "✅ Stock supprimé avec succès");
        const closeM = document.getElementById('closeStock');
        closeM?.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeStock'));
        console.log(this.errors)
      }
    });
  }

  // Product search/selection
  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllProducts(page, this.searchTerm).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }



  // ************************************* About autocomplete *************************************
  getProduct() {
    this.fetchProducts(1);
  }

  selectProduct(produ: Product): void {
    if (produ?.name && produ.name !== this.searchTerm) {
      this.searchTerm = produ?.name;
      this.productDetail = { // Set product details for display to user
        reference: produ?.code,
        image: produ?.imageFront
      };
      this.formProduct.patchValue({ // Set form values based on selected product to send in backend
        product: produ?.id,
        reference: produ?.code,
        sellPrice: convertAmount(produ?.sell_price)
      });
    }
  }


  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // or whatever logic you use
    if (!term) {
      this.productDetail = { reference: '', image: '' };
      this.formProduct.patchValue({ // Set form values based on selected product to send in backend
        product: 0,
        reference: ''
      });
    }
  }
  // ************************************* End About autocomplete *************************************


  resetForm() {
    this.searchTerm = ''
    this.defectiveItem = false
    this.errors = [];
    this.productDetail = { reference: '', image: '' };
    this.searchTerm = '';
    this.searchTermP = '';
    this.formProduct.patchValue({
      product: 0,
      reference: '',
      provider: 0,
      quantity: 0,
      expDate: '',
      cost_price: 0,
      barCode: ''
    });
    this.clickOutsideModal()
    this.clickOutsideModalAddItem()
  }

  getDetailOfProductFromBackend(itemStock: StockMvt) { //go to backend and retrieve detail of specific product
    this.stockMvtService.getDetailProd(itemStock?.product?.id).subscribe({
      next: (res: { product: Product }) => {
        if ('product' in res) {
          this.detailProd = {
            name: res?.product?.name,
            referenceStock: itemStock?.indiceStock,
            quantity: itemStock?.quantity,
            quanty: 0,
          }
        }
        this.loading = false
      }
    })
  }

  getDetailOfProduct(itemStock: StockMvt) {
    this.titleModal = "Article à transférer"
    this.idLot = itemStock?.id
    this.loading = true
    this.setSellingPrice = false
    this.defectiveItem = false
    this.transfertItem = false
    this.errors = []
    this.getDetailOfProductFromBackend(itemStock)
  }

  setTheSellingPrice(item: StockMvt): void {
    this.titleModal = "Définir le prix de vente"
    this.setSellingPrice = true
    this.defectiveItem = false
    this.transfertItem = false
    this.idLot = item?.id
    this.lotSelected = item
    this.sellingPricing = formatPriceFr(item?.sellPrice) || 0
    this.getDetailOfProductFromBackend(item)
    this.errors = []
  }

  reportDefectiveItems(itemStock: StockMvt) {
    this.titleModal = "Déclarer les articles comme non utilisables"
    this.lotSelected = itemStock
    this.defectiveItem = true
    this.setSellingPrice = false
    this.transfertItem = false
    this.errors = []
    this.getDetailOfProductFromBackend(itemStock)
  }


  // Provider search/selection
  fetchProviders(page: number = 1) {
    this.articleManagementService.getProvider(page, this.searchTermP).subscribe({
      next: (data: any) => {
        this.all_providers = data?.results;
      }
    });
  }

  getProvider() {
    this.fetchProviders(1);
  }

  searchProvider() {
    this.fetchProviders(1);
  }

  selectProvider(provid: Provider): void {
    this.searchTermP = provid?.name;
    this.all_providers = [];
    this.formProduct.patchValue({ provider: provid?.id });
  }

  clickOutsideModal() {
    this.all_products = [];
    this.all_providers = [];
  }

  // ******************************* About to show or hide column *******************************
  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  isColumnVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }
  // ******************************* End About to show or hide column *******************************

  // --- Export helpers ---
  getExportRows(data: StockMvt[], columns: ColumnConfig[]) {
    return data?.map(lot => columns?.map(col => {
      switch (col?.key) {
        case 'product': return lot?.product?.name || '';
        case 'provider': return lot?.provider?.name || '';
        case 'quantity': return lot?.quantity ?? '';
        case 'indiceStock': return lot?.indiceStock ?? '';
        case 'created_at': return lot?.created_at ? new Date(lot?.created_at).toLocaleDateString() : '';
        case 'expDate': return lot?.expDate ? new Date(lot?.expDate).toLocaleDateString() : '';
        case 'purchase_price': return formatPriceFr(lot?.purchase_price) + ' ' + this.devise;
        case 'sell_price': return formatPriceFr(lot?.sellPrice) + ' ' + this.devise;
        case 'validStock': return lot?.validStock ? 'Validé' : 'Non validé';
        default: return '';
      }
    }));
  }

  async exportAllToPDF(): Promise<void> {
    this.loading = true;
    try {
      await exportAllOrFilterToPDF({
        fetchDataFn: (searchTerm) =>
          this.stockMvtService.getStockIn(1, searchTerm, false).pipe(
            map((res: { result: StockMvt[] }) => res?.result)
          ),
        searchTerm: this.searchTermStock,
        columns: this.columns,
        getExportRows: this.getExportRows.bind(this),
        theDate: this.the_date,
        title: "Export de stock",
        nameFile: "export_stock"
      });
    } catch (err) {
      console.error("Export PDF (All Items) error", err);
      toastShow('error', "❌ Une erreur est survenue pendant l'export PDF");
    } finally {
      this.loading = false;
    }
  }


  async exportAllItemToExcel(): Promise<void> {
    this.loading = true;
    try {
      await exportToExcelAllItem({
        fetchDataFn: (term) =>
          firstValueFrom(
            this.stockMvtService.getStockIn(1, term, false).pipe(
              map((res: { result: StockMvt[] }) => res?.result)
            )
          ),
        searchTermStock: this.searchTermStock,
        columns: this.columns,
        getExportRows: this.getExportRows.bind(this),
        theDate: this.the_date,
        fileName: 'Stock_'
      });
    } catch (err) {
      console.error("Export Excel (All Items) error", err);
      toastShow('error', "❌ Une erreur est survenue pendant l'export Excel");
    } finally {
      this.loading = false;
    }
  }


  // ************************************* About transfert item *************************************
  confirmTransfertItem() {
    this.isTransfert = true
    const transfertData = {
      idWHStore: this.idWHStore
    }
    this.stockMvtService.postConfirmItemTransfert(transfertData).subscribe({
      next: () => {
        this.fetchStockLot(1);
        this.itemsToTransfert = [];
        this.idWHStore = 0; // Reset warehouse/store ID after confirmation
        this.fetchStockLot(1)
        this.isTransfert = false
        toastShow('success', "✅ Transfert d'articles confirmé");
        const closeBtn = document.getElementById('closeModalTransfert001');
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isTransfert = false
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

  // Search and select warehouse/store for item transfert
  searchWhStore(term: string) {
    this.searchTermWhStor = term;
    this.fetchWhStore(); // or whatever logic you use
    if (!term) {
      this.idWHStore = 0; // Reset the warehouse/store ID if no term is entered
    }
  }


  fetchWhStore() {
    this.stockMvtService.getWarehousesTransfert(this.searchTermWhStor).subscribe({
      next: (data: any) => {
        this.all_warehouses_stores = data?.result || [];
      }
    });
  }


  selectWhStore(event: any) {
    if (event?.nameWh && event.nameWh !== this.searchTermWhStor) {
      this.searchTermWhStor = event?.nameWh;
      this.idWHStore = event?.id;
    }
  }
  // End Search and select warehouse/store for item transfert


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


  addItemToTransfert() {
    this.stockMvtService.postItemTransfert(this.detailProd).subscribe({
      next: () => {
        toastShow('success', "✅ Article ajouté au transfert");
        const closeBtn = document.getElementById('closeModalAddItem');
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
      }
    })
  }


  setThSellingPrice() {
    this.loading = true
    const data = { sellingPrice: this.sellingPricing }
    this.stockMvtService.postSellPrice(this.lotSelected?.id, data).subscribe({
      next: () => {
        this.all_stocks_lot = this.all_stocks_lot.filter(item => item.id !== this.lotSelected?.id);
        this.fetchStockLot(1)
        toastShow("success", "✅ Prix de vente défini")
        const closeBtn = document.getElementById('closeModalAddItem');
        this.loading = false
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.loading = false;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
      }
    })
  }


  validDefectiveItem() {
    this.loading = true
    const data = { quantity: this.detailProd?.quanty, t_badge: this.setBadge }
    this.stockMvtService.postDefectiveProduct(this.lotSelected?.id, data).subscribe({
      next: (res: any) => {
        this.all_stocks_lot = this.all_stocks_lot.filter(item => item.id !== this.lotSelected?.id);
        this.all_stocks_lot?.unshift(res?.result)
        toastShow("success", "✅ Article mis en rébut")
        this.loading = false
        const closeBtn = document.getElementById('closeModalAddItem');
        this.loading = false
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.loading = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
      }
    })
  }

  generateRandom8DigitNumber() {
    const min = 10000000; // Smallest 8-digit number (10^7)
    const max = 99999999; // Largest 8-digit number (10^8 - 1)
    this.formProduct.patchValue({
      barCode: Math.floor(Math.random() * (max - min + 1)) + min
    })
  }


  async onBarcodeScannedAdd() {
    const code = await this.scanner.scan();

    if (code) {
      playBeep(); // 🔊
      this.formProduct?.patchValue({
        barCode: code
      })
    }
  }


  clickOutsideModalAddItem() {
    this.all_warehouses_stores = [];
  }

  trackById(index: number, col: any): number {
    return col.id; // or any unique field
  }
}

