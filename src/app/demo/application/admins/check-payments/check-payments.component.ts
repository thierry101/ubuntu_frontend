/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";

@Component({
  selector: 'app-check-payments',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent],
  templateUrl: './check-payments.component.html',
  styleUrl: './check-payments.component.scss'
})
export class CheckPaymentsComponent implements OnInit {

  isLoading: boolean = false
  searchTerm: string = ''
  pages: number[] = [];
  filterStatus = '';
  filterMethod = '';
  filterService = '';
  errors: any = []
  listPayments: any[] = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchPayments(1)
  }


  fetchPayments(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.adminService.getAllPayments.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        console.log(data)
        this.listPayments = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }


  onPageChangePaymentsPayments(page: number) {
    this.fetchPayments(page);
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
    console.log('Payment status changed:', payment?.status_payment);
    this.adminService.putPayment(payment?.id, data).subscribe({
      next: (res: any) => {
        console.log("the result is ", res)
        toastShow('success', '✅ Statut de paiement mis à jour avec succès.')
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  resetFilters(): void {
    this.filterStatus = '';
    this.filterMethod = '';
    this.filterService = '';
  }

  openImage(url: string): void {
    Swal.fire({
      imageUrl: url,
      imageAlt: 'Preuve de paiement',
      showConfirmButton: false,
      showCloseButton: true,
      width: '30%'
    });
  }

}


