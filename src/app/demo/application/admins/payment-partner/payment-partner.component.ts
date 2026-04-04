/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { AdminService } from 'src/app/services/admin.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { Observable } from 'rxjs';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment-partner',
  standalone: true,
  imports: [SharedModule, QuillModule, SubmitSpinnerComponent, SetPaginationComponent, SearchListComponent],
  templateUrl: './payment-partner.component.html',
  styleUrl: './payment-partner.component.scss'
})
export class PaymentPartnerComponent implements OnInit {
  isSavingFaq: boolean = false;
  isLoading: boolean = false;
  isEdit: boolean = false;
  idFaq: number = 0
  question: string = '';
  answer: string = '';
  errors: any = []
  searchTerm: string = ''
  listFaqs: any[] = []
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchFaq(1)
  }


  resetForm() {
    this.question = ''
    this.answer = ''
    this.errors = []
    this.isEdit = false
    this.idFaq = 0
  }


  fetchFaq(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.adminService.getFaq.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        console.log(data)
        this.listFaqs = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }


  onPageChangeInvoice(page: number) {
    this.fetchFaq(page);
  }


  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchFaq(1);
  }


  saveFaq() {
    this.isSavingFaq = true
    const data = {
      question: this.question,
      answer: this.answer
    }
    this.adminService.postFaq(data).subscribe({

      next: () => {
        toastShow('success', '✅ FAQ enregistrée.')
        this.question = ''
        this.answer = ''
        this.errors = []
        this.isSavingFaq = false
        document.getElementById('closeFaqModal')?.click();
        this.fetchFaq(1)
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSavingFaq = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  saveEditFaq() {
    this.isSavingFaq = true
    const data = {
      question: this.question,
      answer: this.answer
    }
    this.adminService.putFaq(this.idFaq, data).subscribe({

      next: () => {
        toastShow('success', '✅ FAQ mis à jour.')
        this.question = ''
        this.answer = ''
        this.errors = []
        this.isSavingFaq = false
        document.getElementById('closeFaqModal')?.click();
        this.fetchFaq(1)
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSavingFaq = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


    deleteFaq(idFaq: any) {
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
          this.adminService.deleteFaq(idFaq).subscribe({
            next: () => {
              this.listFaqs = this.listFaqs.filter(item => item.id !== idFaq);
              this.errors = []
              toastShow("success", "✅ FAQ supprimée avec succès");
            },
            error: (err) => {
              this.errors = err?.error?.errors || [];
              showError(err, err.status, this.errors, err.error);
            }
          })
        }
      });
    }


  editFaq(faq: any) {
    this.isEdit = true
    this.idFaq = faq?.id
    this.question = faq?.question
    this.answer = faq?.answer
  }
  
}
