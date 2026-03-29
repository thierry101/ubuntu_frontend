/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ColumnConfig, StockMvt } from 'src/app/interfaces/global';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { getDateString, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SearchListComponent } from "../../../application/reusableComponents/search-list/search-list.component";
import { PublicService } from 'src/app/services/public.service';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { ColumnsSelectedComponent } from "src/app/demo/application/reusableComponents/columns-selected/columns-selected.component";
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map } from 'rxjs';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-valid-inventory',
  standalone: true,
  imports: [SetPaginationComponent, SharedModule, SearchListComponent, SpinnersComponent, ColumnsSelectedComponent],
  providers: [DecimalPipe], // 👈 Add this
  templateUrl: './valid-inventory.component.html',
  styleUrl: './valid-inventory.component.scss'
})
export class ValidInventoryComponent implements OnInit {
  searchTerm: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_stocks_lot: StockMvt[] = [];
  validCheck: boolean = false
  devise: string = ""
  isLoading: boolean = false
  the_date: string = ''
  columns: ColumnConfig[] = [
    { key: 'product', label: 'Article', visible: true },
    { key: 'refStock', label: 'Référence stock', visible: true },
    { key: 'expDate', label: "Date d'expiration", visible: true },
    { key: 'provider', label: "Fournisseur", visible: true },
    { key: 'quantity', label: 'Quantité', visible: true },
    { key: 'purchase_Price', label: 'Prix de revient', visible: true },
    { key: 'valid', label: 'Validé', visible: true }
  ];
  errors: any = [];

  constructor(private stockMvtService: StockMvtService, private publicService: PublicService,
    private decimalPipe: DecimalPipe, private columnVisibility: ColumnsVisibilityService) { }

  ngOnInit(): void {
    this.the_date = getDateString()
    this.fetchStockValidate(1)
    this.columnVisibility.setColumns(this.columns); //call the service
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
  }

  getValueVali(item: any) {
    if (item) {
      return 'Oui'
    } else {
      return 'Non'
    }
  }

  //*************************************** About export //***************************************
  // --- Export helpers ---
  getExportRows(data: any[], columns: ColumnConfig[]) {
    return data.map(lot => columns.map(col => {
      switch (col.key) {
        case 'product': return lot?.product || '';
        case 'refStock': return lot?.indiceStock || '';
        case 'expDate': return lot?.stockWhStore?.expDate ? new Date(lot?.stockWhStore?.expDate).toLocaleDateString() : '';
        case 'provider': return lot?.provider || '';
        case 'quantity': return lot?.quantity || '';
        case 'purchase_Price': return this.decimalPipe.transform(lot?.purchase_price, '1.0-0') + ' ' + this.devise || '';
        case 'valid': return this.getValueVali(lot?.validStock) || '';
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

  validateProduct(lot: StockMvt, event: any) {
    this.validCheck = event.target.checked
    lot.validStock = this.validCheck
    const data = {
      validCheck: this.validCheck
    }
    this.stockMvtService.putValidStock(lot?.id, data).subscribe({
      next: () => {
        this.fetchStockValidate(1)
        toastShow('success', "✅ Statut mis à jour avec succès")
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalStock'));
      }
    })
  }


  // ******************************* About retrieve stock lot, pagination and search  *******************************
  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchStockValidate(1); // reset to first page on search
  }

  fetchStockValidate(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.stockMvtService.getStockInValidate.bind(this.stockMvtService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.all_stocks_lot = data?.listItems;
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }

  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.stockMvtService.getStockInValidate(1, term, false).pipe(
            map((res: { results: any[] }) => res.results)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'Stock_valid_'
    });
  }

  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.stockMvtService.getStockInValidate(1, searchTerm, false).pipe(
          map((res: { results: any[] }) => res.results)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export de stock",
      nameFile: "Stock_valid_"
    });
  }

  onPageChange(page: number) {
    this.fetchStockValidate(page);
  }

  trackById(index: number, col: any): number {
    return col.id; // or any unique field
  }
  // ******************************* End retrieve stock lot, pagination and search  *******************************
}
