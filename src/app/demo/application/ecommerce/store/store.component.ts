/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, TemplateRef } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';
import { isMobileApp, playBeep, setPagination, showError, toastShow } from 'src/app/share/shared';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { PublicService } from 'src/app/services/public.service';
import { SpinnersComponent } from "../../reusableComponents/spinners/spinners.component";
import { RouterModule } from '@angular/router';
import { BarcodeScannerService } from 'android/services/barcode-scanner.service';
// import { NgxScannerQrcodeComponent, NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [SharedModule, ImagePipe, SetPaginationComponent, SearchListComponent, SpinnersComponent, RouterModule,
  ],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
  isCollapsed = false;
  errors: any = []
  product: any = { qty: 1, sold_the_price: 2000 }
  devise: string = ""
  searchTerm: string = ""
  pages: number[] = [];
  all_products: any[] = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  isLoading: boolean = false
  amountB!: number
  editSoldPrice: boolean = true
  days = [
    { key: 'monday', value: 'Lundi' },
    { key: 'tuesday', value: 'Mardi' },
    { key: 'wednesday', value: 'Mercredi' },
    { key: 'thursday', value: 'Jeudi' },
    { key: 'friday', value: 'Vendredi' },
    { key: 'saturday', value: 'Samedi' },
    { key: 'sunday', value: 'Dimanche' },
  ]
  tProd!: any
  selectedProduct!: any;
  isMobileApp: boolean = false;

  // Constructor
  constructor(private storeService: StoreService, private offcanvasService: NgbOffcanvas, private publicService: PublicService,
    public router: Router, private scanner: BarcodeScannerService) { }

  ngOnInit(): void {
    this.fetchProducts(1)
    this.isMobileApp = isMobileApp
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
  }

  // ******************************* About retrieve article, pagination and search  *******************************
  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // reset to first page on search
  }

  //  [value]="product.sellPrice"
  getRigthPrice(product: any) {
    if (!product) return;

    let price = product.sellPrice;

    if (product.active_promotion) {
      const percentage = product.active_promotion.percentage || 0;
      price = product.sellPrice - (product.sellPrice * percentage / 100);
    }

    // Round to nearest multiple of 5 only if price is decimal
    product.sold_the_price = Number.isInteger(price) ? price : Math.round(price / 5) * 5;
  }

  onPriceChange(value: number, product: any) {
    // Keep the value exactly as entered by user
    product.sold_the_price = value;
  }


  fetchProducts(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.storeService.getProductsForStore.bind(this.storeService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.editSoldPrice = data?.editSoldPrice;
      this.all_products = data?.listItems;
      this.all_products.forEach((product: any) => this.getRigthPrice(product));
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number) {
    this.fetchProducts(page);
  }
  // ******************************* End retrieve article, pagination and search  *******************************
  addTocartItem(product: any) {
    this.onPriceChange(product.sold_the_price, product)
    let idLot
    if (product.stockWhStore) {
      idLot = product?.stockWhStore?.id
    }
    else {
      idLot = product?.id
    }
    const data = { qtyAdd: product?.qty, sellingPrice: product?.sold_the_price }
    this.storeService.postAddToCart(idLot, data).subscribe({
      next: (res: any) => {
        toastShow('success', "✅ Article Ajouter dans le panier")
        product.qty = 1
        this.errors = []
        document.getElementById('closeModal0092')?.click();
      },
      error: (err) => {
        if (err.status === 423) {
          // this.router.navigate(['/error-open-hour']);
        }
        else {
          this.errors = [];
          this.errors = err.error.errors;
          showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
        }
      }
    })
  }

  getProductName(product: any): string | null {
    return product?.product || product?.stockWhStore?.product || null;
  }

  getQtyWarning(product: any): string | null {
    return product?.product?.quantityWarning || product?.stockWhStore?.product?.quantityWarning || 0;
  }

  getExpDate(product: any) {
    return product?.expDate || product?.stockWhStore?.expDate || null
  }


  showFilter(content: TemplateRef<string>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  redirectPRoductDetails() {
    this.router.navigate(['/ec/ec-product-detail']);
  }

  increaseQty(product: any) {
    product.qty = product.qty ? product.qty + 1 : 1;
  }

  decreaseQty(product: any) {
    if (product.qty && product.qty > 1) {
      product.qty--;
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
    const regex = /[0-9]|\./;

    if (!regex.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }


  async onBarcodeScanned() {
    const code = await this.scanner.scan();
    if (code) {
      playBeep(); // 🔊
      // const code = result.barcodes[0].rawValue;
      this.storeService.getDetailStockProduct(code).subscribe({
        next: (res: any) => {
          if (res?.result) {
            this.selectedProduct = res?.result;
            this.getRigthPrice(this.selectedProduct);
            document.getElementById('launchModalAddCart')?.click();
          } else {
            alert('Aucun article disponible avec ce code')
          }
        },
        error: (err) => {
          showError(err, err.status, [], err.error, document.getElementById('launchModalAddCart'));
        }
      });
    }
  }


  trackByProduct(index: number, product: any): any {
    return product.id || product?.stockWhStore?.id || index;
  }

}

