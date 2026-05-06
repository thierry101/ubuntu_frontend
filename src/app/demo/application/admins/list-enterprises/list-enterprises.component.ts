/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Enterprise, InvoiceDue } from 'src/app/interfaces/global';
import { AdminService } from 'src/app/services/admin.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import Swal from 'sweetalert2';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";

@Component({
  selector: 'app-list-enterprises',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SearchListComponent, SpinnersComponent, SubmitSpinnerComponent],
  templateUrl: './list-enterprises.component.html',
  styleUrl: './list-enterprises.component.scss'
})
export class ListEnterprisesComponent implements OnInit {
  isLoading: boolean = false
  isSaving: boolean = false
  deviseCurrentEnterprise: string = ''
  searchTerm: string = ''
  payments: InvoiceDue[] = []
  itemEnterprise!: Enterprise
  companies: Enterprise[] = [];
  startDateP: string = ''
  endDateP: string = ''
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  paginationInvoice: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  monthInvoice: string = ''
  errors: any = []

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchEnterprises(1)
  }


  fetchEnterprises(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.adminService.getEnterprises.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.companies = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchEnterprises(page);
  }

  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchEnterprises(1);
  }

  deleteInvoice(invoice: any) {
    Swal.fire({
      title: "Suppression!",
      text: "Êtes vous sûr de vouloir supprimer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteInvoiceManually(invoice?.id).subscribe({
          next: () => {
            this.payments = this.payments.filter(item => item.id !== invoice?.id);
            this.errors = []
            toastShow("success", "✅ Facture supprimée avec succès");
          },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error);
          }
        })
      }
    });
  }

  viewDetails(company: Enterprise, page: number = 1) {
    this.errors = []
    this.monthInvoice = ''
    this.itemEnterprise = company
    this.isLoading = true;
    setPagination(
      this.adminService.getDetailPaymentEnterprise.bind(this.adminService),
      page,
      this.itemEnterprise?.id,
      (data: any) => {
        this.paginationInvoice = data;
        this.payments = data?.listItems;
        this.deviseCurrentEnterprise = data?.devise
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      this.startDateP,
      this.endDateP
    );
  }

  onPageChangeInvoice(page: number) {
    this.viewDetails(this.itemEnterprise, page);
  }


  generateInvoice() {
    this.isSaving = true
    const data = { idEnterprise: this.itemEnterprise?.id, monthInvoice: this.monthInvoice }
    this.adminService.postInvoiceManually(data).subscribe({
      next: (res: { result: InvoiceDue }) => {
        toastShow('success', '✅ Facture générée.')
        this.payments?.unshift(res?.result)
        this.isSaving = false
        this.errors = []
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  concatenateString(string1: string, string2: string) {
    return JSON.stringify(string1) + '/' + JSON.stringify(string2)
  }

}
