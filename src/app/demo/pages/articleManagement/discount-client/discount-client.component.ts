/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Client, Discount } from 'src/app/interfaces/global';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { PublicService } from 'src/app/services/public.service';
import Swal from 'sweetalert2';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";

@Component({
  selector: 'app-discount-client',
  standalone: true,
  imports: [SharedModule, SelectedComponent, SpinnersComponent, SearchListComponent, SetPaginationComponent],
  templateUrl: './discount-client.component.html',
  styleUrl: './discount-client.component.scss'
})
export class DiscountClientComponent implements OnInit {
  couponCode: string = ''
  searchTerm: string = ''
  all_Clients: Client[] = []
  all_Discounts: Discount[] = []
  idClient: number = 0
  phone: string = ''
  email: string = ''
  errors!: any
  typeDiscount: string = 'choisir'
  percentage: number = 0
  amtDiscount: number = 0
  expiredDate: string = ''
  searchTermCoup: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  isLoading: boolean = false
  devise: string = ''

  constructor(private articleManagementService: ArticleManagementService, private publicService: PublicService) { }


  ngOnInit(): void {
    this.fetchDiscount(1)
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTermCoup = term;
    this.fetchDiscount(1); // reset to first page on search
  }


  fetchDiscount(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.articleManagementService.getDiscounts.bind(this.articleManagementService), page, this.searchTermCoup, (data: any) => {
      this.pagination = data;
      this.all_Discounts = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false
    })
  }

  onPageChange(page: number) {
    this.fetchDiscount(page);
  }
  // ****************************** End about pagination invoice and search ******************************

  resetForm() {
    this.idClient = 0,
      this.couponCode = '',
      this.typeDiscount = 'choisir',
      this.percentage = 0,
      this.amtDiscount = 0,
      this.expiredDate = ''
    this.searchTerm = ''
    this.phone = ''
    this.email = ''
    this.errors = []
  }

  saveCouponClient() {
    const data = {
      idClient: this.idClient,
      codeDiscount: this.couponCode,
      typeDiscount: this.typeDiscount,
      percentage: this.percentage,
      amtDiscount: this.amtDiscount,
      expDate: this.expiredDate
    }

    this.articleManagementService.postDiscount(data).subscribe({
      next: () => {
        this.fetchDiscount(1)
        toastShow('success', "✅ Coupon créé")
        const closeModalDiscount = document.getElementById('closeModalDisc0222')
        closeModalDiscount?.click()
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    })
  }

  deleteThePromotion(item: Discount) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer ce coupon!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result: any) => {
      if (result?.isConfirmed) {
        this.articleManagementService.deleteDiscount(item?.id).subscribe({
          next: () => {
            this.all_Discounts = this.all_Discounts.filter((promo: Discount) => promo?.id !== item?.id);
            toastShow('success', "✅ Supprimé avec succès");
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
          }
        });
      }
    });
  }


  // *********************************** Get all products and stores warehouses ***********************************
  fetchClients(page: number = 1) {
    this.articleManagementService.getAllClients(page, this.searchTerm).subscribe({
      next: (data: { results: any[] }) => {
        this.all_Clients = data?.results;
      }
    });
  }

  searchProduct(term: string): void {
    this.searchTerm = term;
    this.fetchClients(1);
  }

  selectProduct(client: Client): void {
    if (client?.name && client.name !== this.searchTerm) {
      this.idClient = client.id;
      this.searchTerm = client.name;
      this.email = client?.email
      this.phone = client?.phone
    }
  }


  generateDiscount(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let result = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    this.couponCode = result;
  }

  clearTableClient() {
    this.all_Clients = []
  }

  trackByDiscountId(index: number, discount: any): any {
    return discount.id;
  }

}
