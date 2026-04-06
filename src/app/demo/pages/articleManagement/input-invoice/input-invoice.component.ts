/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SelectedComponent } from "../../../application/reusableComponents/selected/selected.component";
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { Product, Provider, StockMvt } from 'src/app/interfaces/global';
import { PublicService } from 'src/app/services/public.service';
import { StockMvtService } from 'src/app/services/stock-mvt.service';
import { setPagination, showError, SwallModal, toastShow } from 'src/app/share/shared';
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../../application/reusableComponents/search-list/search-list.component";
import { AuthService } from 'src/app/services/auth.service';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from "src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component";

@Component({
  selector: 'app-input-invoice',
  standalone: true,
  imports: [SharedModule, SelectedComponent, SetPaginationComponent, SearchListComponent, SpinnersComponent, SubmitSpinnerComponent],
  templateUrl: './input-invoice.component.html',
  styleUrl: './input-invoice.component.scss'
})
export class InputInvoiceComponent implements OnInit {
  reasonDel: string = ''
  productEntry = {
    id_product: 0,
    nameProduct: '',
    reference: '',
    quantity: 0,
    unitPrice: 0,
    total: 0,
    barCode: ''
  };
  invoiceDetail = {
    nberInvoice: '',
    provider: 0,
    purchaseDate: ''
  }
  isLoading: boolean = false;
  isSavingInvoice: boolean = false
  isSavingDeposit: boolean = false
  productsAdd: any[] = [];
  all_products: Product[] = [];
  productsInvoice: StockMvt[] = [];
  all_providers: Provider[] = [];
  all_invoices: Provider[] = [];
  searchTerm: string = ''; //to search product when registration stock
  searchTermInvoice: string = ''; //to search product when registration stock
  searchTermP: string = ''
  errors: any = [];
  checkAcompte: boolean = false
  devise: string = ''
  deposit: number = 0
  ModalTitle: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_deposits: any[] = [];
  checkCompletePayment: boolean = false
  totalDeposit: number = 0
  restToPayDeposit: number = 0
  amtDeposit: number = 0
  invoiceSelect!: any
  checkDeleteInvoice: string = ''
  maxDate!: string; // Maximum date for the date input, set to yesterday
  idInvoice: number = 0
  userInfo: any;
  role: string = '';
  adminHasWarehouse: boolean = false
  totalInvoice: number = 0
  dateInvoice: string = ''
  newInvoice!: any

  constructor(private articleManagementService: ArticleManagementService, private publicService: PublicService,
    private stockMvtService: StockMvtService, private authService: AuthService) {
    const today = new Date();
    today.setDate(today.getDate()); // set to yesterday
    this.maxDate = today.toISOString().split('T')[0]; // format as yyyy-mm-dd
  }

  ngOnInit(): void {
    this.userInfo = this.authService.currentUser;
    this.role = this.userInfo?.role;
    if (this.role === 'Admin') {
      this.adminHasWarehouse = !!this.userInfo.whStore;
    }
    this.fetchInvoice(1)
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
  }

  resetFormInvoice() {
    this.ModalTitle = "Enregistrer une facture"
    this.all_providers = [];
    this.all_products = [];
    this.productEntry = {
      id_product: 0,
      nameProduct: '',
      reference: '',
      quantity: 0,
      barCode: '',
      unitPrice: 0,
      total: 0
    };
    this.invoiceDetail = {
      nberInvoice: '',
      provider: 0,
      purchaseDate: ''
    }
    this.productsAdd = []
    this.errors = []
    this.searchTerm = ''
    this.searchTermP = ''
    this.checkAcompte = false
  }



  fetchProviders(page: number = 1) {
    this.articleManagementService.getProvider(page, this.searchTermP).subscribe({
      next: (data: any) => {
        this.all_providers = data?.results;
      }
    });
  }

  // ************************************* About autocomplete *************************************
  // Product search/selection
  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllProducts(page, this.searchTerm).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }

  selectProduct(produ: Product): void {
    if (produ?.name && produ.name !== this.searchTerm) {
      this.searchTerm = produ.name;
      this.productEntry.nameProduct = produ?.name // Set the product name in the entry
      this.productEntry.reference = produ?.code // Set the product reference in the entry
      this.productEntry.id_product = produ?.id // Set the product ID in the entry and send in backend
    }
  }

  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // or whatever logic you use
    if (!term) {
      // if nothing is typed, reset the product entry
      this.productEntry.nameProduct = '' // Reset the product name in the entry
      this.productEntry.reference = '' // Reset the product reference in the entry
      this.productEntry.id_product = 0 // Reset the product ID in the entry
    }
  }

  // getProvider() {
  //   this.fetchProviders(1);
  // }

  searchProvider(term: string) {
    this.searchTermP = term;
    this.fetchProviders(1); // or whatever logic you use
    if (!term) {
      // if nothing is typed, reset the provider entry
      this.invoiceDetail.provider = 0; // Reset the provider ID in the invoice detail
    }
  }

  selectProvider(provid: Provider): void {
    if (provid?.name && provid.name !== this.searchTermP) {
      this.searchTermP = provid.name;
      this.invoiceDetail.provider = provid?.id
    }
  }
  // ************************************* End About autocomplete *************************************
  generateRandom8DigitNumber() {
    const min = 10000000; // Smallest 8-digit number (10^7)
    const max = 99999999; // Largest 8-digit number (10^8 - 1)
    this.productEntry.barCode = JSON.stringify(Math.floor(Math.random() * (max - min + 1)) + min) // Reset the product barCode in the entry
  }


  onAddProduct() {
    const { id_product, nameProduct, reference, quantity, barCode, unitPrice } = this.productEntry;

    if (!id_product || quantity <= 0 || unitPrice <= 0 || !barCode) {
      SwallModal('warning', 'Remplir les champs', 'Veuillez remplir tous les champs correctement.')
      return;
    }

    const exists = this.productsAdd.some(
      p => p.id_product === id_product
    );

    if (exists) {
      alert('Ce produit avec cette référence a déjà été ajouté.');
      return;
    }

    const total = quantity * unitPrice;

    // Push a copy of the current product into the list
    this.productsAdd.push({
      nameProduct,
      id_product,
      reference,
      quantity,
      barCode,
      unitPrice,
      total
    });
    this.errors = []

    // Reset the form
    this.searchTerm = ''
    this.productEntry = {
      id_product: 0,
      nameProduct: '',
      reference: '',
      quantity: 0,
      unitPrice: 0,
      total: 0,
      barCode: ''
    };
  }

  get totalSum(): number {
    return Math.round(
      this.productsAdd.reduce((sum, item) => sum + item.total, 0)
    );
  }

  get restToPay(): number {
    if (this.totalSum > this.deposit) {
      return this.totalSum - this.deposit
    }
    return this.totalSum
  }

  removeItem(item: any) {
    this.productsAdd = this.productsAdd.filter((product: any) => product?.id_product !== item?.id_product);
  }

  // ****************************** End about pagination invoice and search ******************************
  onSearchChange(term: string) {
    this.searchTermInvoice = term;
    this.fetchInvoice(1); // reset to first page on search
  }

  fetchInvoice(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.stockMvtService.getStockInvoice.bind(this.stockMvtService), page, this.searchTermInvoice, (data: any) => {
      this.pagination = data;
      this.all_invoices = data?.listItems;
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }

  onPageChange(page: number) {
    this.fetchInvoice(page);
  }
  // ****************************** End about pagination invoice and search ******************************


  // ****************************** About the invoice ******************************
  saveInvoice() {
    const data = {
      invoice_header: this.invoiceDetail,
      table_products: this.productsAdd,
      big_total: this.totalSum,
      check_deposit: this.checkAcompte,
      deposit: this.deposit
    }
    this.isSavingInvoice = true
    this.stockMvtService.postStockInvoice(data).subscribe({
      next: () => {
        const ele_id = document.getElementById("closeModalInvoice")
        ele_id?.click()
        this.fetchInvoice(1);
        toastShow('success', "✅ Facture enregistrée avec succès")
        this.isSavingInvoice = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSavingInvoice = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  deleteInvoice() {
    this.stockMvtService.deleteInvoice(this.invoiceSelect?.nberInvoice, { reason: this.reasonDel }).subscribe({
      next: () => {
        this.fetchInvoice(1);
        toastShow('success', "✅ Facture supprimée avec succès")
        const ele_id = document.getElementById("closeModalInvoice01")
        ele_id?.click()
        this.errors = []
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  retrieveDel(invoice: any) {
    this.errors = []
    this.invoiceSelect = invoice
    this.reasonDel = ''
    this.checkDeleteInvoice = ''
  }

  showProduct(idInvoice: number, lotInventory: StockMvt[], invoice: any) {
    this.totalInvoice = invoice?.totalInvoice
    this.dateInvoice = invoice?.dateInvoice
    this.idInvoice = idInvoice
    this.productsInvoice = lotInventory
    this.retrieveDeposit(invoice)
  }

  retrieveDeposit(invoice: any) {
    this.errors = []
    this.idInvoice = invoice?.id
    this.invoiceSelect = invoice
    this.checkCompletePayment = invoice?.complete
    this.restToPayDeposit = invoice?.totalInvoice
    this.stockMvtService.getDeposit(invoice?.nberInvoice).subscribe({
      next: (res: any) => {
        this.all_deposits = res?.result
        this.totalDeposit = res?.total_deposit
      }
    })
  }

  saveNewDeposit() {
    const data = {
      amtDeposit: this.amtDeposit
    }
    this.isSavingDeposit = true
    this.stockMvtService.putDeposit(this.invoiceSelect?.nberInvoice, data).subscribe({
      next: (res: any) => {
        this.newInvoice = res?.invoice
        this.all_invoices = this.all_invoices.filter((invoic: any) => invoic?.nberInvoice !== this.invoiceSelect?.nberInvoice);
        this.all_deposits?.unshift(res?.payment)
        this.all_invoices?.unshift(this.newInvoice)
        this.totalDeposit += parseFloat(res?.payment?.deposit)
        toastShow('success', "✅ Montant enregistré avec succès")
        this.isSavingDeposit = false
        this.errors = []
        this.amtDeposit = 0
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSavingDeposit = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  deleteDeposit(dep: any) {
    this.stockMvtService.deleteDeposit(dep?.id).subscribe({
      next: (res: any) => {
        this.errors = []
        toastShow('success', "✅ Montant supprimé avec succès")
        this.retrieveDeposit(this.invoiceSelect)
        this.all_invoices = this.all_invoices.filter((invoic: any) => invoic?.nberInvoice !== this.invoiceSelect?.nberInvoice)
        this.newInvoice = res?.result
        this.all_invoices?.unshift(res?.result) //on  change l'état de la facture en cours
      }, error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })

  }


  clickOutsideModal() {
    this.all_products = [];
    this.all_providers = [];
  }

  trackByInvoiceId(index: number, invoice: any): any {
    return invoice?.id;
  }


}
