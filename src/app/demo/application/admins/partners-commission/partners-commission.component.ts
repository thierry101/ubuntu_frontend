/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PartnerService } from 'src/app/services/partner.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { SetPaginationComponent } from '../../reusableComponents/set-pagination/set-pagination.component';
import { AuthService } from 'src/app/services/auth.service';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { AdminService } from 'src/app/services/admin.service';
import { InvoiceDue } from 'src/app/interfaces/global';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { QuillModule } from 'ngx-quill';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-partners-commission',
  standalone: true,
  imports: [SharedModule, SearchListComponent, SetPaginationComponent, SpinnersComponent, ImagePipe, SubmitSpinnerComponent, QuillModule],
  templateUrl: './partners-commission.component.html',
  styleUrl: './partners-commission.component.scss'
})
export class PartnersCommissionComponent implements OnInit {
  role: string = ''
  errors: any = [];
  rejetReason: string = ''
  monthInvoice: string = ''
  invoice: any = {}; // or your model interfac
  isLoading: boolean = false
  isSaving: boolean = false
  isLoadingInvoice: boolean = false
  searchTerm: string = ''
  pages: number[] = [];
  all_invoices_partner_enterprise: any[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  totalAmountInvoiced: number = 0;
  totalPartnerAmount: number = 0;
  totalAmountCollected: number = 0;
  totalPartnerPaid: number = 0;
  totalCommission: number = 0;
  allTotalPartnerPaid: number = 0;
  devise: string = '';


  constructor(private partnerService: PartnerService, private authService: AuthService, private adminService: AdminService,
    private publicService:PublicService
  ) { }

  ngOnInit(): void {
    this.fetchInvoicesPartnerEnterprise(1)
    this.role = this.authService.currentUser?.role
    this.publicService.adminSetting$.subscribe(setting => {
      if (setting) {
        this.devise = setting?.devise
      }
    });
  }

  // On doit avoir également le statut rejeté
  updateStatePayment(invoice: InvoiceDue) {
    this.isLoading = true
    const idButton = document.getElementById('closeModalInvoice002')
    const data = { checker: 'update', idInvoice: invoice?.id, statePayment: invoice?.status_payment, rejetReason: invoice?.rejetReason }
    this.adminService.putDetailInvoice(invoice?.id, data).subscribe({
      next: (res: { result: InvoiceDue }) => {
        this.all_invoices_partner_enterprise = this.all_invoices_partner_enterprise.filter((invoic: any) => invoic.id !== invoice?.id)
        this.all_invoices_partner_enterprise?.unshift(res?.result)
        idButton?.click()
        this.isLoading = false
        toastShow("success", "✅ Statut paiement mis à jour")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoading = false
        showError(err, err.status, this.errors, err.error, idButton);
      }
    })
  }


  payPartner(event: any, invoice: InvoiceDue) {
    this.isLoadingInvoice = true
    const data = { checker: 'partnerPayment', statePaymentPartner: event.target.checked }
    this.adminService.putDetailInvoice(invoice?.id, data).subscribe({
      next: () => {
        this.isLoadingInvoice = false
        toastShow("success", "✅ Statut paiement partenaire mis à jour")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoadingInvoice = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }


  fetchInvoicesPartnerEnterprise(page: number = 1) {
    this.isLoading = true;
    const voidBtn = document.getElementById('')
    setPagination(
      this.partnerService.getInvoiceEnterprisePartner.bind(this.partnerService) as (page: number, searchTerm: any) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.totalPartnerAmount = data?.total_commission
        this.totalPartnerPaid = data?.total_commission_paid
        
        this.totalAmountInvoiced = data?.totals?.total_invoiced
        this.totalAmountCollected = data?.totals?.total_collected
        this.totalCommission = data?.totals?.total_commission
        this.allTotalPartnerPaid = data?.totals?.total_commission_paid
        this.all_invoices_partner_enterprise = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      this.monthInvoice,
      undefined,          // endDate
      (err: any) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoading = false;
        showError(err, err.status, this.errors, err.error, voidBtn);
        // Tu peux ici afficher un toast ou un message d'erreur utilisateur
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchInvoicesPartnerEnterprise(1);
  }

  onPageChange(page: number) {
    this.fetchInvoicesPartnerEnterprise(page);
  }

  filterByMonth() {
    this.fetchInvoicesPartnerEnterprise(1);
  }

  onShowPromoDetails(idInvoice: any) {
    this.isLoadingInvoice = true
    this.errors = [];
    this.adminService.getDetailInvoice(idInvoice).subscribe({
      next: (res: { result: InvoiceDue }) => {
        this.invoice = res?.result
        this.isLoadingInvoice = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoadingInvoice = false
        showError(err, err.status, this.errors, err.error, document.getElementById('a'));
      }
    })
  }

  isImage(file: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
  }

  isPdf(file: string): boolean {
    return /\.pdf$/i.test(file);
  }



}
