/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { servicesProvided, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { AuthService } from 'src/app/services/auth.service';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';

@Component({
  selector: 'app-check-payments',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, ImagePipe, SubmitSpinnerComponent, SearchListComponent, SpinnersComponent],
  templateUrl: './check-payments.component.html',
  styleUrl: './check-payments.component.scss'
})
export class CheckPaymentsComponent implements OnInit {

  isLoading: boolean = false
  loading: boolean = false
  fileType: string | 'image' | 'pdf' | null = null;
  searchTerm: string = ''
  pages: number[] = [];
  paymentPreview: string = ''
  imgPaymentManuel: any = { name: '', file: '' }
  filterStatus = '';
  filterMethod = '';
  filterService = '';
  userInfo!: any;
  idPayment!: any;
  role: string = '';
  isCheckingPayment: boolean = false;
  allServices: any = servicesProvided;
  errors: any = []
  listPayments: any[] = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  constructor(private adminService: AdminService, private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchPayments(1)
    this.userInfo = this.authService.currentUser;
    this.role = this.userInfo?.role;
  }


  fetchPayments(page: number = 1) {
    this.isLoading = true;
    this.loading = true;
    setPagination(
      this.adminService.getAllPayments.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.listPayments = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
        this.loading = false;
      },
      this.filterStatus,
      this.filterService
    );
  }


  onPageChangePaymentsPayments(page: number) {
    this.fetchPayments(page);
  }


  onSearchPayment(term: string) {
    this.searchTerm = term;
    this.fetchPayments(1);
  }


  onSearchChangePayments(term: string) {
    this.searchTerm = term;
    this.fetchPayments(1);
  }


  onStatusChange(payment: any): void {
    if (payment.status_payment === 'Validé') {
      return; // bloque toute modification
    }
    const data = {
      statusPayment: payment.status_payment,
      checker: 'whatsappMsg'
    }
    this.adminService.putQtyMsg(payment?.id, data).subscribe({
      next: () => {
        toastShow('success', '✅ Statut de paiement mis à jour avec succès.')
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  updateProofPayment(idPayment: number) {
    this.idPayment = idPayment
  }


  updatePaymentImg() {
    const data = {
      checker: 'whatsapp_msg',
      'payment_proof': this.imgPaymentManuel
    }
    this.adminService.putPayment(this.idPayment, data).subscribe({
      next: () => {
        toastShow('success', '✅ Preuve de paiement mise à jour avec succès.')
        this.errors = []
        this.paymentPreview = '';
        document.getElementById('closeModalPayment01')?.click()
        this.fetchPayments(this.pagination.currentPage);
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  onImgPaymentChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.paymentPreview = reader.result as string;
        this.imgPaymentManuel.name = file.name;
        this.imgPaymentManuel.file = reader.result;
      };
      reader.onerror = () => {
        toastShow('error', '❌ Une erreur est survenue lors du chargement du logo.');
      };
    }
  }


  filterByStatus() {
    this.fetchPayments(1);
  }

  filterByService() {
    this.fetchPayments(1);
  }


  resetFilters(): void {
    this.filterStatus = '';
    this.filterMethod = '';
    this.filterService = '';
  }


  getServiceName(value: string): string | undefined {
    return this.allServices.find((service: any) => service.value === value)?.name;
  }


  openImage(paiement: any): void {
    // this.typePayment = this.myPayments.find(p => p?.type_payment === invoice?.type_payment) || null;
    if (paiement?.img_payment) {
      // this.previewImage = paiement?.img_payment

      Swal.fire({
        imageUrl: paiement?.img_payment,
        imageAlt: 'Preuve de paiement',
        showConfirmButton: false,
        showCloseButton: true,
        width: '30%'
      });
    }
  }


  openPdf(url: string | undefined) {
    if (!url) return;

    window.open(url, '_blank');
  }


  checkTypeFile(url: string | undefined): 'image' | 'pdf' | 'unknown' {
    if (!url) return 'unknown';

    const cleanUrl = url.split('?')[0];
    const extension = cleanUrl.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    }

    if (extension === 'pdf') {
      return 'pdf';
    }

    return 'unknown';
  }
}




