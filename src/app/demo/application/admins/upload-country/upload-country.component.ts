/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { Observable } from 'rxjs';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-country',
  standalone: true,
  imports: [SharedModule, SubmitSpinnerComponent, SetPaginationComponent, SearchListComponent, SpinnersComponent],
  templateUrl: './upload-country.component.html',
  styleUrl: './upload-country.component.scss'
})
export class UploadCountryComponent implements OnInit {

  selectedFile: File | null = null;
  message: string = '';
  isSaving: boolean = false
  fileName: string = '';
  errors: any = []
  isLoading: boolean = false;
  isLoadingCity: boolean = false;
  searchTerm: string = '';
  searchTermCity: string = '';
  countriesList!: any
  countrySelected: string = '';
  citiesList!: any
  pages: number[] = [];
  pagesCity: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  paginationCity: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchAllCountries(1)
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.fileName = this.selectedFile.name;
      const input = document.getElementById('fileName') as HTMLInputElement;
      input.value = this.fileName;
    }
  }

  uploadFileCountry() {
    this.isSaving = true
    if (!this.selectedFile) {
      this.message = 'Veuillez sélectionner un fichier JSON';
      this.isSaving = false
      return;
    } else {
      this.adminService.postCountryUpload(this.selectedFile).subscribe({
        next: () => {
          this.selectedFile = null;
          this.fileName = '';
          this.isSaving = false
          this.message = ''
          const input = document.getElementById('fileName') as HTMLInputElement;
          if (input) input.value = '';
          toastShow('success', '✅ Pays chargés avec succès.')
        },
        error: (err) => {
          this.isSaving = false
          this.errors = err?.error?.errors || [];
          showError(err, err.status, this.errors, err.error);
        }
      })
    }
  }


  fetchAllCountries(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.adminService.getCountryUpload.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.countriesList = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }


  onPageChange(page: number) {
    this.fetchAllCountries(page);
  }

  onSearchCountry(term: string) {
    this.searchTerm = term;
    this.fetchAllCountries(1);
  }


  retrieveCities(country: string) {
    this.countrySelected = country
    this.fetchAllCities(1)
  }

  activeRegister(country: any, event: any) {
    country.visible_register = event.target.checked
    const data = { newState: event.target.checked }
    this.adminService.putCitiesBasedCountry(country?.name, data).subscribe({
      next: () => {
        toastShow('success', '✅ Statut mis à jour.')
      }
    })
  }


  deleteCountry(country: string) {
    this.isSaving = true
    Swal.fire({
      title: "Suppression!",
      text: "Êtes vous sûr de vouloir supprimer ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { checker: 'country' }
        this.adminService.deleteCitiesBasedCountry(country, data).subscribe({
          next: () => {
            this.isSaving = false
            this.errors = []
            this.countriesList = this.countriesList.filter((tCountry: any) => tCountry?.name !== country)
            toastShow('success', '✅ Pays et ville supprimé');
          }
        })
      }
    });
  }


  deleteCities(city: string) {
    this.isSaving = true
    Swal.fire({
      title: "Suppression!",
      text: "Êtes vous sûr de vouloir supprimer ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { checker: 'city' }
        this.adminService.deleteCitiesBasedCountry(city, data).subscribe({
          next: () => {
            this.isSaving = false
            this.errors = []
            this.citiesList = this.citiesList.filter((tCity: any) => tCity?.name !== city)
            toastShow('success', '✅ Ville supprimée');
          }
        })
      }
    });
  }



  fetchAllCities(page: number = 1) {
    this.isLoadingCity = true;
    setPagination(
      this.adminService.getCitiesBasedCountry.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTermCity,
      (data: any) => {
        this.paginationCity = data;
        this.citiesList = data?.listItems;
        this.pagesCity = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoadingCity = false;
      },
      this.countrySelected
      // startDate and endDate are not passed — that's OK
    );
  }


  onSearchCity(term: string) {
    this.searchTermCity = term;
    this.fetchAllCities(1);
  }


  onPageChangeCity(page: number) {
    this.fetchAllCities(page);
  }


}
