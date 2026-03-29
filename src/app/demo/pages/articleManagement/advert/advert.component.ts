/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubmitSpinnerComponent } from "src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component";
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-advert',
  standalone: true,
  imports: [SharedModule, SubmitSpinnerComponent, SetPaginationComponent, SpinnersComponent, SearchListComponent, SubmitSpinnerComponent],
  templateUrl: './advert.component.html',
  styleUrl: './advert.component.scss'
})
export class AdvertComponent implements OnInit {

  nameAdvertising: string = ''
  headerMsg: string = ''
  headerContent: string = "Salut 👋"
  footer1Msg: string = "Cliquez sur le bouton ci-dessous pour y accéder 👇"
  footerContent: string = "Merci pour votre confiance 🙏"
  contentMsg: string = ''
  isSaving: boolean = false
  isLoading: boolean = false
  currentTime: Date = new Date();
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  paginationClient: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pagesClient: number[] = [];
  isLoadingClient: boolean = false
  all_advertising!: any
  all_clients!: any
  searchTerm: string = ''
  errors!: any
  selectedClients = new Set<number>();
  adminSetting$ = this.publicService.adminSetting$;
  quantity: number = 0
  unitPrice: number = 0;
  total: number = 0;
  devise: string = ''
  nberWhatsappMsg: number = 0
  idTemplate: number = 0
  isSend: boolean = false

  constructor(private articleManagementService: ArticleManagementService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.fetchAdvertising(1)
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.nberWhatsappMsg = res?.nberWhatsappMsgPub
        this.devise = res?.devise;
      }
    });
    this.publicService.adminSetting$.subscribe(setting => {
      if (setting) {
        this.unitPrice = setting.pub_whatsapp;
        this.calculateTotal();
      }
    });
  }

  calculateTotal(value?: number) {
    const qty = value ?? this.quantity;
    this.total = qty * this.unitPrice;
  }


  sendClient() {
    this.isSend = true
    const data = { idClients: this.getSelectedIds(), idTemplate: this.idTemplate }
    this.articleManagementService.postSendAdvertising(data).subscribe({
      next: (res: any) => {
        this.nberWhatsappMsg = res?.rest_msg
        toastShow('success', '✅ Publicité envoyée avec succès.')
        document.getElementById('closeModalPub002')?.click()
        this.isSend = false

      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
        this.isSend = false
      }
    })
  }


  fetchAdvertising(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.articleManagementService.getAdvertising.bind(this.articleManagementService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.all_advertising = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false
    })
  }


  onPageChange(page: number) {
    this.fetchAdvertising(page);
  }


  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchAdvertising(1); // reset to first page on search
  }


  fetchClientAdvertising(page: number = 1, idTemplate: number = 0) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.selectedClients.clear()
    this.idTemplate = idTemplate
    this.isLoadingClient = true
    setPagination(this.articleManagementService.getClientAdvertising.bind(this.articleManagementService), page, this.searchTerm, (data: any) => {
      this.paginationClient = data;
      this.all_clients = data?.listItems;
      this.pagesClient = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoadingClient = false
    })
  }


  toggleClient(id: number): void {
    if (this.selectedClients.has(id)) {
      this.selectedClients.delete(id);
    } else {
      if (this.selectedClients.size >= 50) return; // limite atteinte
      this.selectedClients.add(id);
    }
  }

  selectAll(): void {
    this.all_clients?.slice(0, 50).forEach((c: any) => this.selectedClients.add(c.id));
  }

  isDisabled(id: number): boolean {
    return this.selectedClients.size >= 3 && !this.selectedClients.has(id);
  }

  deselectAll(): void {
    this.selectedClients.clear();
  }

  getSelectedClients() { //Renvoie l'objet complet séléctionné
    return this.all_clients.filter((c: any) => this.selectedClients.has(c.id));
  }


  getSelectedIds(): number[] { // Renvoie uniquement les ids
    return Array.from(this.selectedClients);
  }


  saveAdvertising() {
    this.isSaving = true
    // const msg = `${this.contentMsg} \n ${this.footer1Msg}`
    const data = {
      nameAdvertising: this.nameAdvertising,
      headerMsg: this.headerMsg,
      contentMsg: this.contentMsg,
      footer1Msg: this.footer1Msg
    }

    this.articleManagementService.postAdvertising(data).subscribe({
      next: () => {
        this.errors = []
        this.nameAdvertising = ''
        this.headerMsg = ''
        this.contentMsg = ''
        this.fetchAdvertising(1)
        document.getElementById('closeAdvertModal')?.click()
        this.isSaving = false
        toastShow('success', "✅ Publicité créée")

      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    })
  }

}
