/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Expensive, SaveExpensive, Warehouse } from 'src/app/interfaces/global';
import { ExpensiveService } from 'src/app/services/expensive.service';
import { PublicService } from 'src/app/services/public.service';
import { getDateString, setPaginationMultiParams, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment.prod';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { ColumnsSelectedComponent } from "../../reusableComponents/columns-selected/columns-selected.component";
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map } from 'rxjs';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [SharedModule, NgSelectModule, SetPaginationComponent, ColumnsSelectedComponent, SearchListComponent, SpinnersComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit {
  name: string = ''
  errors: any = [];
  arrayExpensives: Expensive[] = []
  arrayExpensives2: Expensive[] = []
  modalTitle: string = ''
  modalTitleSave: string = ''
  edit_expensive: boolean = false
  itemToEdit!: Expensive
  formExpensiv!: FormGroup
  isLoading: boolean = false
  loading: boolean = false
  searchTerm: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_expensives: SaveExpensive[] = []
  startDate: string = ''
  endDate: string = ''
  devise: string = ""
  idWhStore: number = 0
  urlMedia: string = ""
  the_date: string = ""
  role: string = ''
  warehouses: Warehouse[] = []
  totalExpense: number = 0
  permissions!: any
  columns = [
    { key: 'expense', label: 'Dépense', visible: true },
    { key: 'amount', label: 'Montant', visible: true },
    { key: 'dateExpense', label: 'Mois de la dépense', visible: true },
    { key: 'whStor', label: 'Boutique/magasin', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'attachment', label: 'Pièce jointe', visible: true },
    { key: 'action', label: 'Action', visible: true },
  ];

  constructor(private expensiveService: ExpensiveService, private fb: FormBuilder, private publicService: PublicService,
    private columnVisibility: ColumnsVisibilityService, private authService: AuthService
  ) {
    this.formExpensiv = this.fb.group({
      idExpensive: 'Choisir...',
      amount: 0,
      description: '',
      dateExpense: '',
      file: { name: '', file: '' }
    })
  }
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.role = this.authService.getRole?.role
    this.the_date = getDateString()
    this.columnVisibility.setColumns(this.columns); //call the service
    this.urlMedia = environment.siteUrlMedia
    this.fetchSaveExpensives(1)
    this.authService.getPermissions().subscribe({
      next: (res: any) => {
        this.permissions = res?.result ?? [];
        if (this.permissions?.includes("handle_expenses") || this.role === 'Admin') {
          this.loading = true
          this.expensiveService.getExpensive().subscribe({
            next: (res: { results: Expensive[] }) => {
              this.arrayExpensives = res?.results
              this.loading = false
            }
          })
        }
        this.checkAccessAndLoadWarehouses()
      },
      error: err => {
        console.error("❌ Failed to load permissions:", err);
      }
    });

    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });

  }

  get hasHandleExpenses(): boolean {
    return this.permissions?.includes("handle_expenses");
  }

  checkAccessAndLoadWarehouses(): void {
    if (this.role === 'Admin' || this.role === 'Daf' || this.hasHandleExpenses) {
      this.publicService.getWarehouseStore().subscribe({
        next: (res: { result: Warehouse[] }) => {
          this.warehouses = res?.result;
        },
        error: (err) => {
          console.error("Error loading warehouses:", err);
        }
      });
    }
  }


  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchSaveExpensives(1); // reset to first page on search
  }

  filterByWhStore() {
    this.fetchSaveExpensives(1)
  }

  fetchSaveExpensives(page: number = 1) {
    this.isLoading = true;
    setPaginationMultiParams(this.expensiveService.getSaveExpensive.bind(this.expensiveService), page, this.searchTerm, this.idWhStore, (data: any) => {
      this.pagination = data;
      this.totalExpense = this.pagination?.amount_collect_day
      this.all_expensives = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false;
    },
      this.startDate,
      this.endDate,
      true,
    );
  }

  onPageChange(page: number) {
    this.fetchSaveExpensives(page);
  }

  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchSaveExpensives(1);
  }

  downloadFile(filePath: string) {
    const link = document.createElement('a');
    link.href = this.urlMedia + filePath;           // Full URL to the file, e.g. https://yourdomain.com/media/files/report.pdf
    link.target = '_blank';
    link.download = '';             // You can optionally specify a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  uploadFile(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.formExpensiv.patchValue({
          file: { name: file.name, file: reader.result }
        })
      }
    }
  }

  resetForm() {
    this.modalTitle = "Créer une dépense"
    this.edit_expensive = false
    this.name = ''
    this.errors = []
  }

  resetRegisterExpensive() {
    this.modalTitleSave = "Enregistrer une dépense"
    this.fileInput.nativeElement.value = '';
    this.formExpensiv = this.fb.group({
      idExpensive: 'Choisir...',
      amount: 0,
      description: '',
      dateExpense: '',
      file: { name: '', file: '' }
    })
    this.errors = []
    this.expensiveService.retrieveExpensive().subscribe({
      next: (res: { results: Expensive[] }) => {
        this.arrayExpensives2 = res?.results
      }
    })
  }

  editExpensive(item: Expensive) {
    this.errors = []
    this.itemToEdit = item
    this.modalTitle = "Modifier une dépense"
    this.edit_expensive = true
    this.name = item?.name
  }


  deleteExpensive(item: Expensive) {
    const idDelete = item?.id
    this.expensiveService.deleteExpensive(item?.id).subscribe({
      next: (res: any) => {
        this.arrayExpensives = this.arrayExpensives.filter((expense: Expensive) => expense?.id !== item?.id);
        toastShow('success', "✅ Dépense supprimée")
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModal0045'));
      }
    })
  }


  createExpensive() {
    const data = { name: this.name }
    this.expensiveService.postExpensive(data).subscribe({
      next: (res: { result: Expensive }) => {
        this.arrayExpensives?.unshift(res?.result)
        toastShow('success', "✅ Dépense créée")
        this.errors = []
        this.name = ''
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModal0045'));
      }
    })
  }

  saveEditExpensive() {
    const data = { name: this.name }
    this.expensiveService.putExpensive(this.itemToEdit?.id, data).subscribe({
      next: (res: { result: Expensive }) => {
        this.arrayExpensives = this.arrayExpensives.filter((expense: Expensive) => expense?.id !== this.itemToEdit?.id);
        this.arrayExpensives?.unshift(res?.result)
        toastShow('success', "✅ Dépense modifiée")
        this.errors = []
        this.name = ''
        document.getElementById('closeModal0045')?.click()
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModal0045'));
      }
    })
  }

  saveNewExpense() {
    this.expensiveService.postSaveExpensive(this.formExpensiv?.value).subscribe({
      next: (res: { result: SaveExpensive }) => {
        this.all_expensives?.unshift(res?.result)
        this.totalExpense = this.all_expensives.reduce((sum, item: any) => sum + parseFloat(item?.amount), 0);
        toastShow('success', "✅ Dépense enregistrée")
        this.fileInput.nativeElement.value = '';
        this.formExpensiv = this.fb.group({
          idExpensive: 'Choisir...',
          amount: 0,
          description: '',
          dateExpense: '',
          file: { name: '', file: '' }
        })
        this.errors = []
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModal0040'));
      }
    })
  }


  deletePermission(idSaveExpense: number) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cette dépense!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.expensiveService.deleteSaveExpensive(idSaveExpense).subscribe({
          next: () => {
            this.all_expensives = this.all_expensives.filter((saveExpense: SaveExpensive) => saveExpense?.id !== idSaveExpense)
            this.totalExpense = this.all_expensives.reduce((sum, item: any) => { return sum + parseFloat(item?.amount || '0'); }, 0);
            toastShow('success', "✅ Dépense supprimée avec succès");
          },
          error: (err) => {
            showError(err, err?.status, this.errors, err?.error);
          }
        });
      }
    });
  }

  // ******************************* About to show or hide column *******************************
  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  isVisible(columnKey: string): boolean {
    return this.columnVisibility.isVisible(columnKey);
  }

  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: (searchTerm) =>
        this.expensiveService.getSaveExpensive(1, searchTerm, this.idWhStore, this.startDate, this.endDate, false).pipe(
          map((res: { results: SaveExpensive[] }) => res.results)
        ),
      searchTerm: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export des dépenses",
      nameFile: "export_expense"
    });
  }


  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: (term) =>
        firstValueFrom(
          this.expensiveService.getSaveExpensive(1, term, this.idWhStore, this.startDate, this.endDate, false).pipe(
            map((res: { results: any[] }) => res.results)
          )
        ),
      searchTermStock: this.searchTerm,
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'export_expense'
    });
  }

  formatToMonthYear(dateStr: string): string {
    return formatDate(dateStr, 'MMMM yyyy', 'fr');
  }


  // --- Export helpers ---
  getExportRows(data: SaveExpensive[], columns: any[]) {
    return data.map(saveInvoice => columns.map(col => {
      switch (col.key) { //the name inside each case must be the same in the columns
        case 'expense': return saveInvoice?.expense?.name || '';
        case 'amount': return Math.round(saveInvoice?.amount) || 0;
        case 'dateExpense': return this.formatToMonthYear(saveInvoice?.dateExpense) || 0;
        case 'whStor': return saveInvoice?.warehouse?.nameWh || '';
        case 'description': return saveInvoice?.description || '';
        case 'attachment': return saveInvoice?.attachement || '';
        case 'action': return '';
        default: return '';
      }
    }));
  }

  trackByExpensiveId(index: number, saveInvoice: any): number {
    return saveInvoice?.id; // or any unique field
  }

}
