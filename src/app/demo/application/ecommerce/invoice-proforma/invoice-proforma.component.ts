/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { CartProducts, Client, Orders, Product } from 'src/app/interfaces/global';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatPriceFr, setPaginationMultiParams, showError, toastShow } from 'src/app/share/shared';
import { ExpensiveService } from 'src/app/services/expensive.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import Swal from 'sweetalert2';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-invoice-proforma',
  standalone: true,
  imports: [SharedModule, SelectedComponent, ImagePipe, SpinnersComponent, SetPaginationComponent, SearchListComponent],
  templateUrl: './invoice-proforma.component.html',
  styleUrl: './invoice-proforma.component.scss'
})
export class InvoiceProformaComponent implements OnInit {
  all_roles: string[] = ['Admin', 'siteAdmin', 'Agent', 'Agency'];
  role: string = '';
  permissions: string[] = [];
  searchTerm: string = ''; //to search product when registration stock
  all_products: Product[] = [];
  errors: any = [];
  nameProd: string = ''
  formInvoice!: FormGroup
  arrayProds: CartProducts[] = []
  devise: string = ""
  searchClient: string = ""
  all_clients: Client[] = [];
  clientInfo: Partial<Client> = {
    name: '',
    phone: '',
    email: ''
  };
  idClient: number = 0
  showClient: boolean = false
  isLoading: boolean = false
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_orders_invoices: Orders[] = []
  itemInvoice!: Orders
  startDate: string = ''
  endDate: string = ''

  constructor(private articleManagementService: ArticleManagementService, private fb: FormBuilder, private storeService: StoreService,
    private expensiveService: ExpensiveService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.fetchInvoiceProforma(1)
    this.formInvoice = this.fb.group({
      idLot: 0,
      nameProd: '',
      qty: 0,
      soldPrice: 0,
    })

    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });

    this.expensiveService.getAddInvoice().subscribe({
      next: (res: { results: CartProducts[] }) => {
        this.arrayProds = res?.results
      }
    })
  }

  choiceClient() {
    this.showClient = true
  }

  hideClient() {
    this.showClient = false
  }

  showInvoice(item: Orders) {
    this.itemInvoice = item
  }

  deleteInvoice(item: Orders) {
    Swal.fire({
      title: "Êtes vous sûr de vouloir supprimer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.expensiveService.deleteConfirmAddInvoice(item?.id).subscribe({
          next: (res: any) => {
            this.all_orders_invoices = this.all_orders_invoices.filter(itemCart => itemCart?.id !== item?.id);
            toastShow('success', "✅ Facture supprimer")
          }
        })
      }
    });
  }

  fetchInvoiceProforma(page: number = 1) {
    this.isLoading = true;
    setPaginationMultiParams(this.expensiveService.getConfirmInvoice.bind(this.expensiveService), page, this.searchTerm, 0, (data: any) => {
      this.pagination = data;
      this.all_orders_invoices = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false;
    },
      this.startDate,
      this.endDate,
      true,
    );
  }

  onPageChange(page: number) {
    this.fetchInvoiceProforma(page);
  }

  onSearchChangeInvoice(term: string) {
    this.searchTerm = term;
    this.fetchInvoiceProforma(1);
  }


  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllIndicesStoks(page, this.searchTerm).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }

  // Called by autocomplete on input
  searchProduct(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // or whatever logic you use
  }


  selectProduct(produ: any): void {
    if (produ?.product && produ?.product !== this.searchTerm) {
      this.searchTerm = produ?.indiceStock
      this.formInvoice.patchValue({
        idLot: produ?.id,
        nameProd: produ?.product,
        qty: 1,
        soldPrice: formatPriceFr(produ?.sellPrice)
      })
    }
  }

  saveCommand() {
    this.expensiveService.postAddInvoice(this.formInvoice.value).subscribe({
      next: (res: { result: CartProducts }) => {
        this.arrayProds = this.arrayProds.filter(item => item?.product?.id !== this.formInvoice.get('idLot')?.value);
        this.arrayProds?.unshift(res?.result)
        this.formInvoice = this.fb.group({
          idLot: 0,
          nameProd: '',
          qty: 0,
          soldPrice: 0,
        })
        this.errors = []
        this.searchTerm = ""
        toastShow('success', "✅ Article Ajouter dans le panier")

      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  deleteItem(item: CartProducts) {
    this.expensiveService.deleteAddInvoice(item?.id).subscribe({
      next: (res: any) => {
        this.arrayProds = this.arrayProds.filter(itemCart => itemCart?.product?.id !== item?.product?.id);
        toastShow('success', "✅ Article supprimé")
      }
    })
  }

  saveInvoice() {
    this.expensiveService.postConfirmInvoice({ idClient: this.idClient }).subscribe({
      next: (res: { result: Orders }) => {
        this.all_orders_invoices?.unshift(res?.result)
        const modalInvoice = document.getElementById('showModalInvoice')
        modalInvoice?.click()
        this.itemInvoice = res?.result
        this.arrayProds = []
        this.idClient = 0
        this.errors = []
        this.showClient = false
        toastShow('success', "✅ Facture créée")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  fetchClients(page: number = 1): void {
    this.storeService.getClients(page, this.searchClient).subscribe({
      next: (data: any) => {
        this.all_clients = data?.results || [];
      }
    });
  }

  searchClients(term: string): void {
    this.searchClient = term;
    this.fetchClients(1);
  }

  selectClient(client: Client): void {
    if (client?.name && client.name !== this.searchClient) {
      this.idClient = client.id;
      this.searchClient = client.name;
      this.clientInfo = {
        phone: client.phone,
        email: client.email
      };
    }
  }

  clickOutsideModal() {
    this.all_products = [];
    this.all_clients = [];
  }


  printInvoice(): void {
    const invoiceElement = document.getElementById('invoicePrint');
    if (!invoiceElement) return;

    // Clone the invoice section
    const invoiceHTML = invoiceElement.innerHTML;

    // Open a new browser window for printing
    const printWindow = window.open('', '_blank', 'width=900,height=1000');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <head>
          <title>Facture Proforma - ${this.itemInvoice?.nberInvoice || ''}</title>

          <!-- Bootstrap CSS -->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

          <!-- Optional custom fonts -->
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

          <style>
            body {
              font-family: 'Poppins', 'Segoe UI', sans-serif;
              background: #ffffff;
              color: #000;
              padding: 20px;
            }

            table {
              border-collapse: collapse !important;
            }

            .table th, .table td {
              vertical-align: middle !important;
            }

            .table-bordered {
              border: 1px solid #dee2e6 !important;
            }

            .table-bordered th,
            .table-bordered td {
              border: 1px solid #dee2e6 !important;
            }

            /* Force exact color printing */
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;

            /* A4 print format */
            @page {
              size: A4;
              margin: 20mm;
            }

            @media print {
              body {
                margin: 0;
              }
              .no-print {
                display: none !important;
              }
              .table {
                page-break-inside: auto;
              }
              tr, td, th {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              thead {
                display: table-header-group;
              }
              tfoot {
                display: table-footer-group;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${invoiceHTML}
          </div>
        </body>
      </html>
    `);
      printWindow.document.close();

      // Wait a moment for styles/fonts to load before printing
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 800);
    }
  }


  exportPDF(): void {
    const element = document.getElementById('invoicePrint');
    if (!element) return;

    const options: any = {
      margin: [10, 10, 10, 10],
      filename: `Proforma_${this.itemInvoice?.nberInvoice || 'facture'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    element.style.backgroundColor = '#ffffff';
    html2pdf().set(options).from(element).save();
  }



}
