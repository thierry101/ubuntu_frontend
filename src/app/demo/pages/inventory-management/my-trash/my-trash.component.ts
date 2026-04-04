/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { getDateString, setPaginationStockMvt, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { ColumnsSelectedComponent } from "src/app/demo/application/reusableComponents/columns-selected/columns-selected.component";
import { ColumnConfig, Warehouse } from 'src/app/interfaces/global';
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { AuthService } from 'src/app/services/auth.service';
import { PublicService } from 'src/app/services/public.service';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';

@Component({
  selector: 'app-my-trash',
  standalone: true,
  imports: [SharedModule, ColumnsSelectedComponent, SearchListComponent, SetPaginationComponent, SpinnersComponent],
  templateUrl: './my-trash.component.html',
  styleUrl: './my-trash.component.scss'
})
export class MyTrashComponent implements OnInit {
  loading: boolean = false;
  the_date: string = ''
  searchTerm: string = ''
  warehouses: Warehouse[] = []
  selectWhShop: number = 0
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  allStrashProds!: any
  errors: any = [];
  startDate: string = ''
  role: string = ''
  endDate: string = ''
  permissions: string[] = [];
  userHasPermission: boolean = true
  columns: ColumnConfig[] = [
    { key: 'date', label: "Date", visible: true },
    { key: 'user', label: "Utilisateur", visible: true },
    { key: 'product', label: 'Article', visible: true },
    { key: 'refStock', label: 'Référence stock', visible: true },
    { key: 'quantity', label: 'Quantité', visible: true },
    { key: 'statut', label: 'Statut', visible: true },
    { key: 'confirm', label: 'Confirmation', visible: true }
  ];

  constructor(private authService: AuthService, private stockMvtService: StockMvtService,
    private columnVisibility: ColumnsVisibilityService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.fetchDefectiveProduct(1)
    this.role = this.authService.currentUser?.role
    this.permissions = this.authService.currentPermissions || [];
    this.userHasPermission = this.permissions.includes('watch_trash_prod')

    this.columnVisibility.setColumns(this.columns); //call the service
    this.the_date = getDateString()
    if (this.role === 'Admin' || this.role === 'Daf') {
      this.publicService.getWarehouseStore().subscribe({
        next: (res: { result: Warehouse[] }) => {
          this.warehouses = res?.result;
        }
      });
    }

  }


  fetchDefectiveProduct(page: number = 1) {
    this.loading = true;
    setPaginationStockMvt(
      this.stockMvtService.getDefectiveProduct.bind(this.stockMvtService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.allStrashProds = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.loading = false;
      },
      this.startDate,
      this.endDate,
      this.selectWhShop
    );
  }

  onPageChange(page: number) {
    this.fetchDefectiveProduct(page);
  }


  // Stock pagination/search
  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchDefectiveProduct(1);
  }

  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchDefectiveProduct(1);
  }

  filterByWhStore() {
    this.fetchDefectiveProduct(1)
  }


  deleteItemToTransfert(idProdTrash: number) {
    Swal.fire({
      title: "Suppression!",
      text: "Êtes-vous sûr de vouloir supprimer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.stockMvtService.deleteDefectiveProduct(idProdTrash).subscribe({
          next: () => {
            this.fetchDefectiveProduct(1);
            this.errors = []
            toastShow('success', "✅ Article supprimé");
          },
          error: (err) => {
            this.errors = err.error.errors || [];
            showError(err, err.status, this.errors, err.error, document.getElementById('closeModalAddItem'));
          }
        })
      }
    });
  }


  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.stockMvtService.getDefectiveProduct(1, term, this.startDate, this.endDate, this.selectWhShop, false).pipe(
            map((res: { results: any[] }) => res?.results)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'Trash_'
    });
  }


  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.stockMvtService.getDefectiveProduct(1, searchTerm, this.startDate, this.endDate, this.selectWhShop, false).pipe(
          map((res: { results: any[] }) => res?.results)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export de stock",
      nameFile: "export_stock"
    });
  }


  // ******************************* About to show or hide column *******************************
  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  isColumnVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }

  //*************************************** About export //***************************************
  // --- Export helpers ---
  getExportRows(data: any[], columns: ColumnConfig[]) {
    return data.map(trashProd => columns.map(col => {
      switch (col.key) {
        case 'date': return trashProd?.updated ? new Date(trashProd?.updated).toLocaleDateString() : '';
        case 'user': return (trashProd?.user?.email) || '';
        case 'product': return trashProd?.lotWhStock?.product?.name ?? '';
        case 'refStock': return trashProd?.lotWhStock?.indiceStock ?? '';
        case 'quantity': return trashProd?.quantity ?? '';
        case 'statut': return this.returnNameBadge(trashProd?.badge) ?? '';
        case 'confirm': return this.returnNameConfirm(trashProd?.confirm) ?? '';
        default: return '';
      }
    }));
  }

  returnNameBadge(nameBadge: any) {
    if (nameBadge === 'expired') {
      return 'Expiré'
    }
    if (nameBadge === 'bad') {
      return 'Défectueux'
    }
  }

  returnNameConfirm(nameBadge: any) {
    if (nameBadge === 0) {
      return 'Validation en cours ...'
    }
    if (nameBadge === 1) {
      return 'Oui'
    }
    if (nameBadge === 2) {
      return 'Non'
    }
  }


  trackById(index: number, col: any): number {
    return col.id; // or any unique field
  }

}
