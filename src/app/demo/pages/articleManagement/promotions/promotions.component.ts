/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { Promotion, StockMvt, Warehouse } from 'src/app/interfaces/global';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [SharedModule, SelectedComponent, SetPaginationComponent, SearchListComponent, SpinnersComponent, SubmitSpinnerComponent],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  searchTermStock: string = ''
  searchTermWhStor: string = ''
  all_products: StockMvt[] = []
  all_wh_stores: Warehouse[] = []
  all_promotions: Promotion[] = []
  editItemPromotion!: Promotion
  errors!: any
  nameProduct: string = ''
  idStock: number = 0
  namePromotion: string = ''
  percentage: number = 0
  expDate: string = ''
  searchTermPromotion: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  nameWhStor: string = ''
  pages: number[] = [];
  isLoading: boolean = false
  titlePromotion: string = ''
  toEdit: boolean = false
  loadSpinnerPromo: boolean = false

  constructor(private articleManagementService: ArticleManagementService) { }

  ngOnInit(): void {
    this.fetchPromotion(1)
  }

  savePromotion() {
    const data = {
      name: this.namePromotion,
      idStock: this.idStock,
      percentage: this.percentage,
      idsWhStores: this.getSelectedStoreIds(),
      expDate: this.expDate
    }
    this.loadSpinnerPromo = true
    this.articleManagementService.postPromotion(data).subscribe({
      next: () => {
          this.fetchPromotion(1)
        toastShow('success', "✅ Promotion créée")
        const idmodalPromo = document.getElementById('closeModelPromo009')
        idmodalPromo?.click()
        this.errors = []
        this.loadSpinnerPromo = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.loadSpinnerPromo = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    })
  }


  updatePromotion() {
    const idmodalPromo = document.getElementById('closeModelPromo009')
    this.loadSpinnerPromo = false
    const data = {
      percentage: this.percentage,
      expDate: this.expDate
    }
    this.articleManagementService.editPromotion(this.editItemPromotion?.id, data).subscribe({
      next: (res: any) => {
        this.all_promotions = this.all_promotions.filter(promo => promo?.id !== this.editItemPromotion?.id);
        this.all_promotions?.unshift(res?.result)
        idmodalPromo?.click()
        this.loadSpinnerPromo = false
        toastShow('success', "✅ Promotion modifiée")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.loadSpinnerPromo = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    })
  }


  deleteThePromotion(item: Promotion) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cette promotion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.articleManagementService.deletePromotion(item?.id).subscribe({
          next: () => {
            this.fetchPromotion(1)
            toastShow('success', "✅ Supprimé avec succès");
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
          }
        });
      }
    });
  }


  editPromotion(item: any) {
    this.toEdit = true
    this.editItemPromotion = item
    this.titlePromotion = "Éditer la promotion"
    this.namePromotion = item?.name
    this.searchTermStock = item?.product?.indiceStock
    this.nameProduct = item?.product?.product_name
    this.percentage = item?.percentage
    this.nameWhStor = item?.warehouseShop?.nameWh
    this.expDate = item?.expirationDate

  }


  resetForm() {
    this.toEdit = false
    this.titlePromotion = "Créer une promotion pour un article"
    this.articleManagementService.getAllWhStoresFromStock().subscribe({
      next: (res: any) => {
        this.all_wh_stores = res?.result;
      }
    })
    this.all_products = []
    this.errors = []
    this.searchTermStock = ''
    this.namePromotion = '',
      this.idStock = 0,
      this.percentage = 0,
      this.expDate = '',
      this.nameProduct = ''
  }


  // ****************************** End about pagination invoice and search ******************************
  onSearchChange(term: string) {
    this.searchTermPromotion = term;
    this.fetchPromotion(1); // reset to first page on search
  }


  fetchPromotion(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.articleManagementService.getPromotions.bind(this.articleManagementService), page, this.searchTermPromotion, (data: any) => {
      this.pagination = data;
      this.all_promotions = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false
    })
  }

  onPageChange(page: number) {
    this.fetchPromotion(page);
  }
  // ****************************** End about pagination invoice and search ******************************

  // *********************************** Get all products and stores warehouses ***********************************
  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllProductsFromStock(page, this.searchTermStock).subscribe({
      next: (data: { results: any[] }) => {
        this.all_products = data?.results;
      }
    });
  }

  searchProduct(term: string): void {
    this.searchTermStock = term;
    this.fetchProducts(1);
  }

  selectProduct(prodInStock: StockMvt): void {
    if (prodInStock?.indiceStock) {
      this.idStock = prodInStock?.id;
      this.searchTermStock = prodInStock?.indiceStock;
      this.nameProduct = prodInStock?.product?.name
      this.all_products = []
    }
  }


  getSelectedStoreIds(): number[] { //method to retrieve all stores warehouses selected
    return this.all_wh_stores
      ?.filter((store: Warehouse) => store?.checked)
      .map(store => store?.id);
  }
  // *********************************** End get all products and stores warehouses ***********************************

  clearTable() {
    this.all_products = []
  }

  trackByPromotionId(index: number, invoice: any): any {
    return invoice?.id;
  }

}
