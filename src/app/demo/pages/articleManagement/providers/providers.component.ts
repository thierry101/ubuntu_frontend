/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Provider } from 'src/app/interfaces/global';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { PublicService } from 'src/app/services/public.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';
import { SetPaginationComponent } from "../../../application/reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../../application/reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [SharedModule, NgSelectModule, SetPaginationComponent, SearchListComponent, SpinnersComponent, SubmitSpinnerComponent, SelectedComponent],
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.scss'
})
export class ProvidersComponent implements OnInit {
  all_countries!: any
  country: string = ''
  errors: any = []
  list_providers: Provider[] = []
  cities!: any
  formProvider: FormGroup
  titleModalProvider: string = ''
  editProvider: boolean = false
  isSaving: boolean = false
  providerToEdit!: Provider
  idProvider: number = 0
  pagination!: any;
  pages: number[] = [];
  searchTerm: string = ''
  isLoading: boolean = false
  searchTermCountry: string = ''
  searchTermCity: string = ""
  idCountry: number = 0


  constructor(private publicService: PublicService, private articleManagementService: ArticleManagementService, private fb: FormBuilder) {
    this.formProvider = this.fb.group({
      name: '',
      codeP: '',
      emailP: '',
      phoneP: '',
      siteInternet: '',
      country: '',
      city: '',
      address: '',
    })
  }

  ngOnInit(): void {
    this.fetchProviders(1)
  }

  searchCountry(term: string) {
    this.searchTermCountry = term;
    this.publicService.getAllCountries(term).subscribe({
      next: (res: any) => {
        this.all_countries = res?.result
      }
    });
  }


  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchProviders(1); // reset to first page on search
  }


  fetchProviders(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.articleManagementService.getProvider.bind(this.articleManagementService), page, this.searchTerm, (data: any) => {
      this.pagination = data
      this.list_providers = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false
    })
  }


  onPageChange(page: number) {
    this.fetchProviders(page);
  }

  // ************************** Pagination end **************************************

  resetFormProvider() {
    this.clearTable()
    this.titleModalProvider = "Enregistrer un fournisseur"
    this.errors = []
    this.editProvider = false
    this.formProvider.patchValue({
      name: '',
      codeP: '',
      emailP: '',
      phoneP: '',
      siteInternet: '',
      country: '',
      city: '',
      address: '',
    })
    this.searchTermCountry = ''
    this.searchTermCity = ''
  }

  saveProvider() {
    this.isSaving = true
    this.articleManagementService.postProvider(this.formProvider?.value).subscribe({
      next: (res: { result: boolean }) => {
        this.fetchProviders(1)
        this.errors = []
        this.formProvider.patchValue({
          name: '',
          codeP: '',
          emailP: '',
          phoneP: '',
          siteInternet: '',
          country: '',
          city: '',
          address: '',
        })
        this.isSaving = false
        this.searchTermCountry = ''
        this.searchTermCity = ''
        toastShow('success', "✅ Fournisseur créé avec succès")
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  saveEditProvider() {
    this.isSaving = true
    this.articleManagementService.putProvider(this.providerToEdit?.id, this.formProvider?.value).subscribe({
      next: (res: { provider: Provider }) => {
        this.list_providers = this.list_providers.filter((provider: Provider) => provider.id !== this.providerToEdit?.id);
        this.list_providers?.unshift(res?.provider)
        toastShow('success', "✅ Fournisseur édité avec succès")
        this.isSaving = false
        document.getElementById('closeModalProvider')?.click()
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }

  deleteWarehouse(idProvider: number) {
    this.idProvider = idProvider
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer ce fournisseur ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.articleManagementService.deleteProvider(idProvider).subscribe({
          next: () => {
            this.list_providers = this.list_providers.filter((provider: any) => provider?.id !== idProvider);
            this.fetchProviders(1)
            toastShow('success', "✅ Fournisseur supprimé avec succès");
            this.errors = []
          },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error);
          }
        });
      }
    });
  }

  fillProvider(provider: Provider) {
    this.idProvider = provider?.id
    this.idCountry = provider?.id_country
    this.searchTermCountry = provider?.country
    this.searchTermCity = provider?.city
    this.editProvider = true
    this.providerToEdit = provider
    this.titleModalProvider = "Editer un fournisseur"
    this.errors = []
    this.formProvider.patchValue({
      name: provider?.name,
      codeP: provider?.code,
      emailP: provider?.email,
      phoneP: provider?.phone,
      siteInternet: provider?.website,
      country: provider?.country,
      city: provider?.city,
      address: provider?.address,
    })
  }

  selectCityBasedCountry(event: any) {
    this.clearTable()
    if (event?.name) {
      this.idCountry = event?.id
      this.searchTermCountry = event?.name
      this.formProvider.patchValue({
        country: event?.name
      })

    } else {
      this.idCountry = 0
    }
  }

  searchCity(term: string) {
    this.clearTable()
    this.searchTermCity = term;
    if(this.idCountry){
      this.publicService.getAllCities(this.idCountry, term).subscribe({
      next: (res: any) => {
        this.cities = res?.result
      },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error);
          }
    });
    }
  }

  selectCity(event: any) {
    if (event?.name) {
      this.searchTermCity = event?.name
      this.formProvider.patchValue({
        city: event?.name
      })
    }
  }

  clearTable() {
    this.all_countries = []
    this.cities = []
  }

  trackByProviderId(index: number, provider: any): number {
    return provider?.id;
  }


}
