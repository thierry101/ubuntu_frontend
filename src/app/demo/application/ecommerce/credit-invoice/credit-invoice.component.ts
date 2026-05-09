/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CreditNote, CreditNoteItem, InvoiceDue, Warehouse } from 'src/app/interfaces/global';
import { ExpensiveService } from 'src/app/services/expensive.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { setPaginationMultiParams, showError, toastShow, typesPayment } from 'src/app/share/shared';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from '../../reusableComponents/submit-spinner/submit-spinner.component';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";

@Component({
  selector: 'app-credit-invoice',
  standalone: true,
  imports: [SharedModule, SelectedComponent, SpinnersComponent, SubmitSpinnerComponent, SearchListComponent, SetPaginationComponent],
  templateUrl: './credit-invoice.component.html',
  styleUrl: './credit-invoice.component.scss'
})
export class CreditInvoiceComponent implements OnInit {

  searchTermInv: string = ''
  all_invocices: InvoiceDue[] = []
  errors!: any
  nameClient: string = ''
  amtInvoice: number = 0
  all_items!: any
  devise: string = ""
  statusCreditNote: boolean = true //désigne si on rembourse la totalité de la facture ou pas
  selectedItems: any[] = [];
  creditItems: CreditNoteItem[] = [];
  creditTotal = 0;
  invoiceSelected!: any
  isLoadingProd: boolean = false
  defaultTypePayments = typesPayment;
  fetchedTypePayments: any[] = [];
  amounts: { [key: string]: number } = {};
  reasonReturn: string = '';
  amtCollectToClient: number = 0;
  isLoading: boolean = false;
  searchTerm: string = '';
  selectWhShop: number = 0;
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_credits_note: CreditNote[] = []
  startDate: string = ''
  endDate: string = ''
  paymentSelected: any = 0
  typeTrans: any = 0
  selectedCredit: any = null;
  nextPaymentDate: string = '';
  allDepositsCreditNote!: any
  minDate: string = ''
  nextDate: string = ''
  isSaving: boolean = false
  idCreditNote: number = 0
  warehouses: Warehouse[] = []
  role: string = ''
  allTotal!: any
  isSubmitNote: boolean = false


  constructor(private expensiveService: ExpensiveService, private authService: AuthService, private publicService: PublicService, private storeService: StoreService) { }

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
    this.role = this.authService.currentUser?.role
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });

    if (this.role === 'Admin' || this.role === 'Daf') {
      this.publicService.getWarehouseStore().subscribe({
        next: (res: { result: Warehouse[] }) => {
          this.warehouses = res?.result;
        }
      });
    }

    this.publicService.getPaymentWhStore().subscribe({
      next: (res: any) => {
        this.fetchedTypePayments = res?.result;
      }
    });
    this.fetchCreditsNote(1);
  }


  resetFormCreditNote() {
    this.errors = []
    this.amounts = {}
    this.searchTermInv = ''
    this.nameClient = ''
    this.amtCollectToClient = 0
    this.amtInvoice = 0
    this.all_items = []
    this.statusCreditNote = true
    this.reasonReturn = ''
    this.creditTotal = 0
  }


  fetchCreditsNote(page: number = 1) {
    this.isLoading = true;
    setPaginationMultiParams(this.storeService.getCreditsNote.bind(this.storeService), page, this.searchTerm, this.selectWhShop, (data: any) => {
      this.pagination = data;
      this.all_credits_note = data?.listItems;
      this.allTotal = this.pagination?.amount_collect_day
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false;
    },
      this.startDate,
      this.endDate,
      this.paymentSelected,
      true,
      this.typeTrans
    );
  }


  onPageChange(page: number) {
    this.fetchCreditsNote(page);
  }


  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchCreditsNote(1);
  }


  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchCreditsNote(1);
  }


  selectCredit(idCredit: number) {
    this.idCreditNote = idCredit;
    this.storeService.getCreditNote(idCredit).subscribe({
      next: (res: { result: CreditNote, serial_deposit: any }) => {
        this.selectedCredit = res?.result
        this.allDepositsCreditNote = res?.serial_deposit
      }
    })
  }


  printCreditInvoice(idCredit: number) {
    this.idCreditNote = idCredit;
    this.storeService.getCreditNote(idCredit).subscribe({
      next: (res: { result: CreditNote }) => {
        this.selectedCredit = res?.result
        // this.allDepositsCreditNote = res?.serial_deposit
      }
    })
  }


  fetchInvoices(page: number = 1) {
    this.expensiveService.getOrderForCreditInvoice(page, this.searchTermInv).subscribe({
      next: (data: { results: InvoiceDue[] }) => {
        this.all_invocices = data?.results;
      }
    });
  }


  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTermInv = term;
    this.fetchInvoices(1); // or whatever logic you use
    if (!term) {
      this.nameClient = ''
      this.amtInvoice = 0
      this.all_items = []
      this.errors = []
    }
  }


  selectOriginalInvoice(invoice: any) {
    this.isLoadingProd = true
    if (invoice?.nberInvoice) {
      this.invoiceSelected = invoice
      this.searchTermInv = invoice?.nberInvoice
      this.nameClient = invoice?.client?.name
      this.amtInvoice = invoice?.amountToPay
      this.errors = []
      this.creditTotal = 0
      this.creditItems = [] //Tableau des articles à rembourser réinitialisé
      this.amounts = {}
      this.reasonReturn = ''
      this.storeService.getOrderDetail(invoice?.id).subscribe({
        next: (res: any) => {
          this.all_items = res?.result?.listItems
          this.isLoadingProd = false
          this.amtCollectToClient = res?.total_retrieve || 0
        },
        error: (err) => {
          this.errors = err.error.errors || [];
          // this.all_items = []
          // this.reasonReturn = ''
          // this.amounts = {}
          // this.amtCollectToClient = 0
          this.isLoadingProd = false
          showError(err, err.status, this.errors, err.error, document.getElementById('canceledNote001'));
        }
      })
    }
  }


  saveNewpayment() {
    const data = {
      nextDate: this.nextDate,
      amounts: this.amounts
    }
    this.isSaving = true
    this.storeService.putCreditNote(this.idCreditNote, data).subscribe({
      next: (res: any) => {
        // this.all_credits_note = this.all_credits_note.filter(item => item.id !== this.idCreditNote);
        // this.all_credits_note?.unshift(res?.result)
        this.fetchCreditsNote(1)
        this.selectedCredit = res?.result
        // this.allDepositsCreditNote?.unshift(res?.deposit);
        this.isSaving = false
        this.errors = []
        this.amounts = {}
        this.nextDate = ''
        toastShow("success", "✅ Montant enregistré.");
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCredDeposit'));
      }
    })
  }


  // ======================
  // Toggle article
  // ======================
  onItemToggle(item: any) {
    if (item?.selected) {
      item.selectedQuantity = item?.quantity;
      this.errors = []

      this.creditItems.push({
        id: item?.id,
        product_id: item?.product?.id,
        quantity: item?.selectedQuantity,
        unit_price: +item?.sold_price,
        total: item?.selectedQuantity * +item?.sold_price
      });
    } else {
      this.creditItems = this.creditItems.filter(i => i.id !== item?.id);
    }

    this.recalculateTotal();
  }

  // ======================
  // Quantity change
  // ======================
  onQuantityChange(item: any) {
    if (!item.selected) return;

    if (item.selectedQuantity < 1) {
      item.selectedQuantity = 1;
    }

    if (item.selectedQuantity > item?.quantity) {
      item.selectedQuantity = item?.quantity;
    }

    const target = this.creditItems.find(i => i.id === item?.id);
    if (target) {
      target.quantity = item?.selectedQuantity;
      target.total = target.quantity * target.unit_price;
    }

    this.recalculateTotal();
  }

  // ======================
  // Recalculate total
  // ======================
  recalculateTotal() {
    this.creditTotal = this.creditItems.reduce(
      (sum, item) => sum + item?.total,
      0
    );
  }

  // ======================
  // Validate
  // ======================
  validateCreditNote() {
    this.isLoading = true
    this.isSubmitNote = true
    const idCloseModal = document.getElementById('canceledNote001');
    const payload: any = {
      numberInvoice: this.invoiceSelected?.nberInvoice || '',
      is_total: this.statusCreditNote,
      reason: this.reasonReturn,
      amounts: this.amounts,
      nextPaymentDate: this.nextPaymentDate
    };

    payload.items = this.creditItems.map(item => ({
      stock_id: item?.product_id,
      quantity: item?.quantity,
    }));

    payload.total_amount = this.creditTotal;

    this.storeService.postCreditNote(this.invoiceSelected?.id || 0, payload).subscribe({
      next: () => {
        toastShow("success", "✅ Facture d'avoir créée avec succès.");
        this.fetchCreditsNote(1);
        // Reset form or perform any other actions
        this.invoiceSelected = null;
        this.searchTermInv = '';
        this.nameClient = '';
        this.amtInvoice = 0;
        this.all_items = null;
        this.statusCreditNote = true;
        this.creditItems = [];
        this.creditTotal = 0;
        this.amounts = {};
        this.reasonReturn = '';
        this.errors = [];
        this.isLoading = false
        this.isSubmitNote = false
        idCloseModal?.click();

      },
      error: (err) => {
        this.errors = err.error.errors || [];
        this.isLoading = false
        this.isSubmitNote = false
        showError(err, err.status, this.errors, err.error, idCloseModal);
      }
    })
  }


  clickOutside() {
    this.all_invocices = []
  }

}
