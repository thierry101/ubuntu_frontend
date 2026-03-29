/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ItemsValidation } from 'src/app/interfaces/global';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';

@Component({
  selector: 'app-view-transfert',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SearchListComponent, SpinnersComponent],
  templateUrl: './view-transfert.component.html',
  styleUrl: './view-transfert.component.scss'
})
export class ViewTransfertComponent implements OnInit {
  constructor(private stockMvtService: StockMvtService,) { }

  errors: any = []
  searchTerm: string = '';
  reasonDelete: string = ''
  all_items_for_validate: ItemsValidation[] = [];
  transfertDel !: ItemsValidation
  list_items: any[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  isLoading: boolean = false;
  idTransfert: number = 0

  ngOnInit(): void {
    this.fetchValidateItems(1)

  }

  // ************************** Start pagination, search and retrieve items. transfert **************************
  onSearchChangeValidItems(term: string) {
    this.searchTerm = term;
    this.fetchValidateItems(1);
  }

  fetchValidateItems(page: number = 1) {
    this.isLoading = true;
    setPagination(this.stockMvtService.getConfirmItemTransfert.bind(this.stockMvtService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.all_items_for_validate = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }

  onPageChange(page: number) {
    this.fetchValidateItems(page);
  }
  // ************************** End pagination, search and retrieve items. transfert **************************

  transfertToDelete(itemValid: ItemsValidation): void {
    this.idTransfert = itemValid?.id
    this.transfertDel = itemValid;
    this.errors = []
    this.reasonDelete = ''
  }

  deleteTransfert(): void {
    if (this.reasonDelete && this.reasonDelete.trim().length > 0 && this.transfertDel) {
      this.stockMvtService.deleteConfirmTheTransfert(this.transfertDel.id).subscribe({
        next: () => {
          // Remove the deleted item from the UI
          this.fetchValidateItems(1);
          toastShow("success", "✅ Transfert supprimé avec succès");
          // Optionally close modal programmatically
          const modalCloseBtn = document.getElementById('closeModalDelete003');
          if (modalCloseBtn) modalCloseBtn.click();
        },
        error: (err) => {
          this.errors = [];
          if (err?.error?.errors) {
            this.errors = err.error.errors;
          }
          showError(err, err.status, this.errors, err.error, document.getElementById('closeModalDelete003'));
        }
      });
    } else {
      // Optional: Alert user if no reason given
      toastShow("error", "❌ Veuillez fournir une raison de suppression.");
    }
  }


  listProducts(itemValid: ItemsValidation) {
    this.idTransfert = itemValid?.id
    this.errors = []
    this.list_items = itemValid.items;
  }


  trackById(index: number, item?: any): number {
    return item?.id; // or any unique field
  }


}
