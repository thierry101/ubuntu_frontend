/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ColumnConfig, TrashProd, Warehouse } from 'src/app/interfaces/global';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { getDateString, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { ColumnsSelectedComponent } from "src/app/demo/application/reusableComponents/columns-selected/columns-selected.component";
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map } from 'rxjs';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { ArticleManagementService } from 'src/app/services/article-management.service';

@Component({
  selector: 'app-trash-product',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, ColumnsSelectedComponent, SearchListComponent, SpinnersComponent],
  templateUrl: './trash-product.component.html',
  styleUrl: './trash-product.component.scss'
})
export class TrashProductComponent implements OnInit {
  the_date: string = ''
  isLoading: boolean = false
  searchTerm: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  ordered: number = 0
  pages: number[] = [];
  all_stocks_trash: TrashProd[] = [];
  all_wh_stores: Warehouse[] = []
  stateValidate: boolean = false
  errors: any = [];
  columns: ColumnConfig[] = [
    { key: 'product', label: 'Article', visible: true },
    { key: 'provider', label: "Fournisseur", visible: true },
    { key: 'whStore', label: "Boutique/Entrepôt", visible: true },
    { key: 'refStock', label: 'Référence stock', visible: true },
    { key: 'expDate', label: "Date d'expiration", visible: true },
    { key: 'quantity', label: 'Quantité', visible: true },
    { key: 'badge', label: 'Badge', visible: true },
    { key: 'statut', label: 'Statut', visible: true }
  ];

  constructor(private stockMvtService: StockMvtService, private columnVisibility: ColumnsVisibilityService,
    private articleManagementService: ArticleManagementService) { }

  ngOnInit(): void {
    this.columnVisibility.setColumns(this.columns); //call the service
    this.fetchTrashValidate(1)
    this.the_date = getDateString()
    this.articleManagementService.getAllWhStoresFromStock().subscribe({
      next: (res: any) => {
        this.all_wh_stores = res?.result;
      }
    })
  }

  fetchTrashValidate(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.stockMvtService.getTrashValidate.bind(this.stockMvtService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.all_stocks_trash = data?.listItems;
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    },
      this.ordered
    )
  }

  onPageChange(page: number) {
    this.fetchTrashValidate(page);
  }
  orderedItem() {
    this.fetchTrashValidate(1);
  }

  retrieveWhStore() {

  }

  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchTrashValidate(1); // reset to first page on search
  }

  setStatutTrash(item: TrashProd) {
    this.stockMvtService.postTrashValidate(item).subscribe({
      next: (res: { result: TrashProd }) => {
        toastShow('success', "✅ Statut mis à jour avec succès")
        this.all_stocks_trash = this.all_stocks_trash.filter((trash: TrashProd) => trash.id !== item?.id);
        this.all_stocks_trash?.unshift(res?.result)
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        console.log(this.errors)
        showError(err, err.status, this.errors, err.error, document.getElementById('closeSubCat05'));
      }
    })
  }

  returnBadge(item: any) {
    if (item === 'expired') {
      return 'Expiré'
    }
    if (item === 'bad') {
      return 'Défectueux'
    }
  }

  returnStatut(item: any) {
    if (item === 1) {
      return 'Validé'
    }
    else if (item === 2) {
      return 'Non validé'
    }
    else {
      return 'En attente de validation'
    }
  }

  //*************************************** About export //***************************************
  // --- Export helpers ---
  getExportRows(data: any[], columns: ColumnConfig[]) {
    return data.map(lot => columns.map(col => {
      switch (col.key) {
        case 'product': return lot?.lotWhStock?.product || '';
        case 'provider': return lot?.lotWhStock?.provider || '';
        case 'whStore': return lot?.fromWhStore || '';
        case 'refStock': return lot?.lotWhStock?.indiceStock || '';
        case 'expDate': return lot?.stockWhStore?.expDate ? new Date(lot?.stockWhStore?.expDate).toLocaleDateString() : '';
        case 'quantity': return lot?.quantity || '';
        case 'badge': return this.returnBadge(lot?.badge) || '';
        case 'statut': return this.returnStatut(lot?.confirm) || '';
        default: return '';
      }
    }));
  }

  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  isColumnVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }

  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.stockMvtService.getTrashValidate(1, term, this.ordered, false).pipe(
            map((res: { results: any[] }) => res.results)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'Trash_valid_'
    });
  }

  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.stockMvtService.getTrashValidate(1, searchTerm, this.ordered, false).pipe(
          map((res: { results: any[] }) => res.results)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export de stock",
      nameFile: "Trash_valid_"
    });
  }

  trackById(index: number, col: any): number {
    return col.id; // or any unique field
  }

}
