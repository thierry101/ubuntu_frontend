/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CountryPayment, InvoiceDue } from 'src/app/interfaces/global';
import { CatalogService } from 'src/app/services/catalog.service';
import { PublicService } from 'src/app/services/public.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "../../application/reusableComponents/set-pagination/set-pagination.component";
import { SpinnersComponent } from '../../application/reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from "../../application/reusableComponents/submit-spinner/submit-spinner.component";
import { ImagePipe } from 'src/app/pipes/image.pipe';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SpinnersComponent, SubmitSpinnerComponent, ImagePipe],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  amountToPay: string = ''
  dateInvoice: string = ''
  methodPayment: string = ''
  idInvoice: number = 0
  isLoading: boolean = false
  isSubmitPayment: boolean = false
  devise: string = ''
  country: string = ''
  searchTerm: string = ''
  percentage: number = 0
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  errors: any = []
  previewImage: string | ArrayBuffer | null = null;
  uploadedFile: File | null = null;
  fileType: string | 'image' | 'pdf' | null = null;
  myPayments: CountryPayment[] = []
  allInvoices: InvoiceDue[] = [];
  typePayment!: any
  waveContries: any = ["Cote D'Ivoire", "Sénégal", "Burkina Faso", "Mali", "Togo"]
  orangeContries: any = ["Cote D'Ivoire", "Cameroun", "République Démocratique du congo", "Gabon", "Tchad"]
  momoContries: any = ["Cote D'Ivoire", "Cameroun", "République Démocratique du congo", "Gabon", "Tchad"]


  constructor(private catalogService: CatalogService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.fetchInvoices(1)
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.percentage = res?.percentage;
        this.devise = res?.devise;
        this.country = res?.country;
      }
    });
  }

  getPaymentDetail(invoice: InvoiceDue) {
    // console.log(invoice)
    this.uploadedFile = null
    const path = invoice?.file_payment;

    this.idInvoice = invoice?.id
    this.amountToPay = invoice?.amount_to_pay
    this.dateInvoice = JSON.stringify(invoice?.month_invoice) + '/' + JSON.stringify(invoice?.year_invoice)
    this.catalogService.getMyPayments().subscribe({
      next: (res: { result: CountryPayment[] }) => {
        this.myPayments = res?.result
        this.methodPayment = invoice?.type_payment
        this.typePayment = this.myPayments.find(p => p?.type_payment === invoice?.type_payment) || null;
        if (invoice?.file_payment) {
          this.previewImage = invoice?.file_payment
          const lastPart = path.split('.').pop();   // returns "10_2025_orange.pdf"
          if (lastPart) {
            if (lastPart === 'pdf') {
              this.fileType = lastPart
            }
            else {
              this.fileType = 'image'
            }
          }
        }
      }
    })
  }


  validPayment() {
    this.isSubmitPayment = true
    const idModal = document.getElementById('idClosePaymentModal')
    const data = {
      paymentMethod: this.methodPayment, dateToPay: this.dateInvoice, idInvoice: this.idInvoice,
      imgPayment: this.previewImage
    }
    this.catalogService.postImagePayment(data).subscribe({
      next: (res: { result: InvoiceDue }) => {
        this.allInvoices = this.allInvoices.filter(item => item.id !== this.idInvoice);
        this.allInvoices?.unshift(res?.result)
        this.previewImage = null
        this.typePayment = null
        this.methodPayment = ''
        this.errors = []
        this.isSubmitPayment = false
        idModal?.click()
        toastShow("success", "✅ Paiement effectué avec succès");
      },
      error: (err) => {
        this.isSubmitPayment = false
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, idModal);
      }
    })
  }


  fetchInvoices(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true;
    setPagination(this.catalogService.getInvoices.bind(this.catalogService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.allInvoices = data?.listItems;
      this.isLoading = false;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  onPageChange(page: number) {
    this.fetchInvoices(page);
  }


  returnStringAsDate(dateString1: string, dateString2: string): Date {
    const dateString = `${dateString2}-${dateString1}`;
    return new Date(dateString);
  }

  selectPayment(event: any) {
    this.methodPayment = event.target.value
    this.typePayment = this.myPayments.find(p => p?.type_payment === this.methodPayment);
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'Payée':
        return 'bg-success-subtle text-success border-success';
      case 'En retard':
        return 'bg-danger-subtle text-danger border-danger';
      case 'Vérification en cours':
        return 'bg-secondary-subtle text-secondary border-secondary';
      default:
        return 'bg-warning-subtle text-warning border-warning';
    }
  }


  handleFileInput(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    this.uploadedFile = file;

    // Detect file type
    if (file.type === 'application/pdf') {
      this.fileType = 'pdf';

      // Convert PDF to Base64
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;  // <-- PDF Base64 stored here
      };
      reader.readAsDataURL(file);

      return;
    }

    if (file.type.startsWith('image/')) {
      this.fileType = 'image';

      // Convert image to Base64
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;  // <-- Image Base64 stored here
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.previewImage = null;
    this.uploadedFile = null;
    this.fileType = null;
  }





}
