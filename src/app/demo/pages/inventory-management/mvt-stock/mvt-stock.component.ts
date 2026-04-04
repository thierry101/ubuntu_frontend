/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { MovementStock, Product } from 'src/app/interfaces/global';
import { AuthService } from 'src/app/services/auth.service';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { setPaginationStockMvt } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { typesMvt } from 'src/app/share/mouvment';

@Component({
  selector: 'app-mvt-stock',
  standalone: true,
  imports: [SharedModule, SelectedComponent, SetPaginationComponent, SpinnersComponent],
  templateUrl: './mvt-stock.component.html',
  styleUrl: './mvt-stock.component.scss'
})
export class MvtStockComponent implements OnInit {

  searchTermP: string = ''; // to search stock lot
  all_products: Product[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_stocks_mvments: MovementStock[] = [];
  userInfo!: any
  startDate!: string
  endDate!: string
  errors: any = [];
  isLoading: boolean = false
  listMvts!: any
  nameProduct: string = ''
  bad_quantity: number = 0
  expired_quantity: number = 0
  gift_quantity: number = 0
  sell_quantity: number = 0
  lost_quantity: number = 0
  typeOfMvt: any = 0

  constructor(private stockMvtService: StockMvtService, private authService: AuthService, private articleManagementService: ArticleManagementService,) { }

  ngOnInit(): void {
    this.listMvts = typesMvt
    this.fetchStockMovement(1);
    this.userInfo = this.authService.currentUser
  }

  resetChoice() {
    this.searchTermP = ''
    this.startDate = ''
    this.endDate = ''
    this.fetchStockMovement(1);
  }

  printReport() {
    this.stockMvtService.getStockMovement(
      1,
      this.searchTermP,
      this.startDate,
      this.endDate,
      this.typeOfMvt,
      false
    )
    .subscribe({
      next: (data: any) => {
        const originalData = this.all_stocks_mvments;
        const originalPagination = this.pagination;

        this.all_stocks_mvments = data?.results || [];

        setTimeout(() => {
          const printContents = document.getElementById('print-section')?.innerHTML;

          if (printContents) {
            const popupWin = window.open('', '_blank', 'width=900,height=700');

            if (popupWin) {
              popupWin.document.open();
              popupWin.document.write(`
              <html>
                <head>
                  <title>Impression - Mouvement de stock</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
                    th { background-color: #f0f0f0; }
                    h4, h5 { margin: 0 0 10px; }
                    .text-primary { color: #0d6efd; }
                    .text-muted { color: #6c757d; }
                    .fw-bold { font-weight: bold; }
                  </style>
                </head>
                <body onload="window.print(); window.close();">
                  ${printContents}
                </body>
              </html>
            `);
              popupWin.document.close();

              this.all_stocks_mvments = originalData;
              this.pagination = originalPagination;
            } else {
              this.all_stocks_mvments = originalData;
              this.pagination = originalPagination;
              alert('Échec de l\'ouverture de la fenêtre d\'impression.');
            }
          } else {
            this.all_stocks_mvments = originalData;
            this.pagination = originalPagination;
            alert('Aucun contenu à imprimer.');
          }
        }, 300);
      },
      error: () => {
        alert('Erreur lors de l\'impression');
      }
    });
  }


  fetchStockMovement(page: number = 1) {
    this.isLoading = true;
    setPaginationStockMvt(this.stockMvtService.getStockMovement.bind(this.stockMvtService), page, this.searchTermP, (data: any) => {
      this.pagination = data;
      this.all_stocks_mvments = data?.listItems;
      this.bad_quantity = data?.total_bad_quantity
      this.expired_quantity = data?.total_expired_quantity
      this.gift_quantity = data?.total_gift_quantity
      this.sell_quantity = data?.total_sell_quantity
      this.lost_quantity = data?.total_lost_quantity
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false;
    },
      this.startDate,
      this.endDate,
      this.typeOfMvt
    );
  }


  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchStockMovement(1);
  }

  // Product search/selection
  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllIndicesStoks(page, this.searchTermP).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }

  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTermP = term;
    this.fetchProducts(1); // or whatever logic you use
  }


  selectProduct(produ: any): void {
    if (produ?.product && produ?.product !== this.searchTermP) {
      this.searchTermP = produ?.indiceStock;
      this.nameProduct = produ?.product
    }
  }


  onPageChange(page: number) {
    this.fetchStockMovement(page);
  }

  clickOutsideModalAddItem() {
    this.all_products = [];
  }


  trackById(index: number, col: any): number {
    return col.id; // or any unique field
  }

}
