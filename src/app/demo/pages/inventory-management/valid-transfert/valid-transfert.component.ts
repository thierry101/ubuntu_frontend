/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ItemsValidation, Product, Warehouse } from 'src/app/interfaces/global';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { AuthService } from 'src/app/services/auth.service';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { ArticleManagementService } from 'src/app/services/article-management.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-valid-transfert',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SearchListComponent, SelectedComponent, SpinnersComponent],
  templateUrl: './valid-transfert.component.html',
  styleUrl: './valid-transfert.component.scss'
})
export class ValidTransfertComponent implements OnInit {
  constructor(private stockMvtService: StockMvtService, private authService: AuthService, private router: Router,
    private articleManagementService: ArticleManagementService, private publicService: PublicService) {
  }

  errors: any = [];
  isLoading: boolean = false;
  role: string = ''
  searchTerm: string = '';
  searchTermProd: string = '';
  all_products: Product[] = [];
  pages: number[] = [];
  all_items_validate: ItemsValidation[] = [];
  all_warehouses: Warehouse[] = [];
  list_items: any[] = [];
  idTransfert: number = 0;
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  startDate: string = '';
  endDate: string = '';
  qtyDetails: { [id: number]: { received: number, defective: number, lost: number } } = {};
  idProduct: number = 0;
  idStoreWh: number = 0;
  qty_received: number = 0;
  qty_current: number = 0;
  qty_defective: number = 0;
  qty_sell: number = 0;
  current_url: string = this.router.url;
  yes_url: boolean = false
  qty_lost: number = 0;
  permissions!: any
  hasAccess: boolean = false
  hasAccessTemplate: boolean = false
  isLoadingFilter: boolean = false
  adminHasWarehouse: boolean = false;
  userInfo: any;

  ngOnInit(): void {
    this.userInfo = this.authService.getRole
    this.role = this.userInfo?.role
    if (this.role === 'Admin') {
      this.adminHasWarehouse = !!this.userInfo.whStor;
    }
    this.fetchItemsValidate(1);
    this.yes_url = this.current_url?.includes('valid-product') //yes_url vérifie l'url pour afficher les boutiques ou entrepôts
    this.authService.getPermissions().subscribe({
      next: (res: any) => {
        this.permissions = res?.result
        this.hasAccessTemplate = this.permissions?.includes('historik_transfert');
        if (this.role === 'Admin' || this.hasAccessTemplate) {
          this.publicService.getWarehousesStores().subscribe({
            next: (res: { result: Warehouse[] }) => {
              this.all_warehouses = res?.result
            }
          })
        }
      }
    })
  }

  // Stock pagination/search
  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchItemsValidate(1);
  }

  fetchItemsValidate(page: number = 1) {
    this.isLoading = true;
    if (this.current_url?.includes('valid-product')) {//pour avoir la liste des transferts à valider
      setPagination(this.stockMvtService.getItemForValidation.bind(this.stockMvtService), page, this.searchTerm, (data: any) => {
        this.pagination = data;
        this.all_items_validate = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      })
    } else {
      this.authService.getPermissions().subscribe({
        next: (res: any) => {
          this.permissions = res?.result
          this.hasAccess = this.permissions?.includes('historik_transfert'); //Pour avoir l'historique des transferts
          if (this.role === 'Admin' || this.hasAccess) {
            setPagination(this.stockMvtService.getAllItemForValidation.bind(this.stockMvtService), page, this.searchTerm, (data: any) => {
              this.pagination = data;
              this.all_items_validate = data?.listItems;
              this.isLoading = false;
              this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
            })
          }
        }
      })
    }
  }

  onPageChange(page: number) {
    this.fetchItemsValidate(page);
  }

  listProducts(itemValid: ItemsValidation) {
    this.idTransfert = itemValid.id;
    this.list_items = itemValid.items;
    this.list_items.forEach(item => {
      this.qtyDetails[item.id] = {
        received: item?.quantity_received,
        defective: item?.quantity_damaged,
        lost: item?.quantity_lost
      };
    });
  }

  validateTransfert(itemProd: any) {
    const data = {
      idItem: itemProd?.lotWhStock?.id, // id du stock
      newQty: this.qtyDetails[itemProd?.id],
      sellPrice: itemProd?.lotWhStock?.product?.sell_price
    }
    this.stockMvtService.postConfirmTheTransfert(data, this.idTransfert).subscribe({
      next: (res: any) => {
        this.all_items_validate = this.all_items_validate.filter(item => item?.id !== this.idTransfert)
        this.list_items = this.list_items.filter(ite => ite?.lotWhStock?.id !== itemProd?.lotWhStock?.id)
        this.all_items_validate?.unshift(res?.result)
        this.list_items?.unshift(res?.item)
        toastShow('success', "✅ Article validé")
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeSubCat05'));
      }
    })
  }

  filterCount() {
    const data = {
      idProd: this.idProduct,
      startDate: this.startDate,
      endDate: this.endDate,
      idStoreWh: this.idStoreWh,
    }
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    else {
      this.isLoadingFilter = true
      this.stockMvtService.getCumStock(data, this.yes_url).subscribe({
        next: (res: any) => {
          this.qty_received = res?.received
          this.qty_current = res?.currentQty
          this.qty_lost = res?.lost
          this.qty_defective = res?.damaged
          this.errors = []
          this.isLoadingFilter = false
        },
        error: (err) => {
          this.errors = err.error.errors || [];
          this.isLoadingFilter = false
          showError(err, err.status, this.errors, err.error, document.getElementById('closeSubCat05'));
        }
      })

    }
  }

  //************************************* Retrieve products for the selected component *************************************
  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllProducts(page, this.searchTermProd).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }

  selectProduct(produ: Product): void {
    if (produ?.name && produ.name !== this.searchTermProd) {
      this.searchTermProd = produ.name;
      this.idProduct = produ?.id
    }
  }

  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTermProd = term;
    this.fetchProducts(1); // or whatever logic you use
  }
  //************************************* End retrieve products for the selected component *************************************

  clickOutsideModal() {
    this.all_products = [];
  }

  trackById(index: number, item?: any): number {
    return item?.id; // or any unique field
  }

}
