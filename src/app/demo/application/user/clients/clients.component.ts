/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CartProducts, Client, Enterprise, User } from 'src/app/interfaces/global';
import { StoreService } from 'src/app/services/store.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { PublicService } from 'src/app/services/public.service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [SharedModule, SpinnersComponent, SetPaginationComponent, SearchListComponent, RouterModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit {

  constructor(private storeService: StoreService, private publicService: PublicService) { }
  titleModal: string = ''
  email: string = ''
  phone: string = ''
  errors: any = []
  name: string = ''
  searchClient: string = ''
  all_clients: Client[] = [];
  list_items: any[] = [];
  list_products: CartProducts[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  isLoading: boolean = false
  isLoadingProduct: boolean = false
  pages: number[] = [];
  searchTerm: string = ''
  startDate: string = ''
  endDate: string = ''
  devise: string = ""
  idClient: number = 0
  idOrder: number = 0
  editClient: boolean = false
  msgWhatsapp: string = ""
  nberWhatsapp: string = ""

  ngOnInit(): void {
    this.fetchClients(1)
    this.publicService.getSettingEtpriseForCustomisation().subscribe({
      next: (res: { result: Enterprise }) => {
        this.devise = res?.result?.devise
      }
    })
  }

  resetForm() {
    this.titleModal = "Ajouter un client"
    this.email = ''
    this.phone = ''
    this.name = ''
    this.errors = []
    this.editClient = false
  }

  saveClient() {
    const data = {
      name: this.name,
      email: this.email,
      phone: this.phone
    }
    this.storeService.postClient(data).subscribe({
      next: () => {
        this.fetchClients(1)
        this.errors = [];
        this.name = ''
        this.email = ''
        this.phone = ''
        toastShow('success', "✅ Client créé avec succès");
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCreate'));
      }
    })
  }

  saveEditClient() {
    const data = {
      name: this.name,
      email: this.email,
      phone: this.phone
    }
    this.storeService.editClient(this.idClient, data).subscribe({
      next: (res: any) => {
        this.all_clients = this.all_clients.filter((client: Client) => client?.id !== this.idClient);
        this.all_clients?.unshift(res?.result)
        const idModal = document.getElementById('closeModalCreate')
        idModal?.click()
        this.errors = [];
        toastShow('success', "✅ Client modifié avec succès");

      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCreate'));
      }
    })
  }

  deleteClient(item: User) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer ce client!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.storeService.deleteClient(item?.id).subscribe({
          next: () => {
            this.fetchClients(1)
            toastShow('success', "✅ Client supprimé avec succès");
          },
          error: (err) => {
            showError(err, err?.status, this.errors, err?.error);
          }
        });
      }
    });
  }


  onPageChange(page: number) {
    if (page < 1 || page > this.pagination.nber_pages) return;
    this.fetchClients(page);
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchClients(1); // reset to first page on search
  }

  fetchClients(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.storeService.getAllClients.bind(this.storeService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.all_clients = data?.listItems;
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }

  filterItems() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.storeService.getOrderClient(this.idClient, this.startDate, this.endDate).subscribe({
      next: (res: { result: any[] }) => {
        this.list_items = res?.result
      }
    })
  }

  fillTheUser(item: User) {
    this.idClient = item?.id
    this.name = item?.name
    this.email = item?.email
    this.phone = item?.phone
    this.editClient = true
    this.errors = []
  }

  retrieveOrderClient(item: User) {
    this.isLoadingProduct = true
    this.startDate = ''
    this.endDate = ''
    this.idClient = item?.id
    this.storeService.getOrderClient(this.idClient, this.startDate, this.endDate).subscribe({
      next: (res: { result: any[] }) => {
        this.list_items = res?.result
        this.isLoadingProduct = false
      }
    })
  }

  setPhoneNumber(number: string) {
    this.nberWhatsapp = number
    this.msgWhatsapp = ''
  }

  sendWhatsapp() {
    const url = `https://wa.me/${this.nberWhatsapp}?text=${encodeURIComponent(this.msgWhatsapp)}`;
    window.open(url, '_blank'); // Ouvre WhatsApp Web / App
  }


  listProduct(item: any) {
    this.idOrder = item?.id
    this.list_products = item?.listItems
  }

  trackByUserId(index: number, list: any): number {
    return list?.id;
  }

}
