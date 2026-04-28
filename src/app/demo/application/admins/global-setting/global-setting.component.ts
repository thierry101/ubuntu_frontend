/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminSetting, CountryPayment } from 'src/app/interfaces/global';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { AdminService } from 'src/app/services/admin.service';
import { countries } from 'src/app/share/countries';
import { adminTypesPayment, allCountries, setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-global-setting',
  standalone: true,
  imports: [SharedModule, ImagePipe, SetPaginationComponent, SubmitSpinnerComponent],
  templateUrl: './global-setting.component.html',
  styleUrl: './global-setting.component.scss'
})
export class GlobalSettingComponent implements OnInit {
  logoPreview: string | ArrayBuffer | null = null;
  formSetting!: FormGroup
  formPartner!: FormGroup
  globalSetting!: AdminSetting;
  countries: any = []
  cities: any = []
  errors: any = []
  allCountries: any = allCountries
  adminTypesPaiement: any = adminTypesPayment
  countrySelected: any = 0
  typePaiement: any = 0
  numberAccount: string = ''
  isLoading: boolean = false;
  searchTerm: any = '';
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  countriesPayments: CountryPayment[] = [];
  isSaving: boolean = false;
  isSavingGlobalSetting: boolean = false;
  itemToEdit!: CountryPayment
  editPayment: boolean = false
  urlDebt: string = ''

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.formPartner = this.fb.group({
      partnerPercentage: 0
    })
    this.formSetting = this.fb.group({
      name: '',
      country: '',
      city: '',
      email: '',
      phone: '',
      itemPerPage: 0,
      rccm: '',
      niu: '',
      siteUrl: '',
      trackingUrl: '',
      indiceInvoice: '',
      nberDigit: 0,
      simpleWhatsapp: 0,
      pubWhatsapp: 0,
    })
  }

  ngOnInit(): void {
    this.fetchCountriesPayement(1);
    this.countries = countries
    this.adminService.getAdminSetting().subscribe({
      next: (res: { result: AdminSetting }) => {
        this.globalSetting = res?.result
        this.formSetting.patchValue({
          name: this.globalSetting?.name,
          country: this.globalSetting?.country,
          city: this.globalSetting?.city,
          email: this.globalSetting?.email,
          phone: this.globalSetting?.phone,
          itemPerPage: this.globalSetting?.item_per_page || 0,
          rccm: this.globalSetting?.rccm || '',
          niu: this.globalSetting?.niu || '',
          siteUrl: this.globalSetting?.site_url || '',
          trackingUrl: this.globalSetting?.tracking_url || '',
          indiceInvoice: this.globalSetting?.indice_invoice || '',
          nberDigit: this.globalSetting?.digit_length || 0,
          simpleWhatsapp: this.globalSetting?.simple_whatsapp || 0,
          pubWhatsapp: this.globalSetting?.pub_whatsapp || 0,
        })
        this.formPartner.patchValue({
          partnerPercentage: this.globalSetting?.partner_percentag || 0
        })
        this.urlDebt = this.globalSetting?.url_debt || ''
        const result = this.countries.find((obj: any) => obj?.name === this.globalSetting?.country);
        this.cities = result?.cities || [];
        this.logoPreview = this.globalSetting?.logo
      }
    })
  }

  updateSettingGlobal() {
    this.isSavingGlobalSetting = true
    const data = { checker: 'generalSetting', data: this.formSetting?.value }
    this.adminService.putAdminSetting(data).subscribe({
      next: () => {
        toastShow('success', '✅ Paramètres mis à jour avec succès.')
        this.errors = []
        this.isSavingGlobalSetting = false
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
        this.isSavingGlobalSetting = false
      }
    })
  }

  updateSettingPartner() {
    const data = { checker: 'partnerConfig', data: this.formPartner?.value }
    this.adminService.putAdminSetting(data).subscribe({
      next: () => {
        toastShow('success', '✅ Paramètres mis à jour avec succès.')
        this.errors = []
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


    updateUrlDebt() {
    const data = { checker: 'urlDebt', data: {urlDebt: this.urlDebt} }
    this.adminService.putAdminSetting(data).subscribe({
      next: () => {
        toastShow('success', '✅ Paramètres mis à jour avec succès.')
        this.errors = []
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }

  fetchCountriesPayement(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.adminService.getPaymentBasedCountry.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.countriesPayments = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchCountriesPayement(page);
  }

  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchCountriesPayement(1);
  }


  savePaiementMethod() {
    this.isSaving = true; // 👉 désactiver bouton + afficher spinner
    const data = {
      countrySelected: this.countrySelected,
      typePaiement: this.typePaiement,
      numberAccount: this.numberAccount,
    }
    this.adminService.postPaymentBasedCountry(data).subscribe({
      next: (res: { result: CountryPayment }) => {
        this.countriesPayments?.unshift(res?.result)
        toastShow('success', '✅ Numéro de compte créé');
        this.errors = []
        this.countrySelected = 0
        this.typePaiement = 0
        this.numberAccount = ''
        this.isSaving = false; // 👉 réactiver bouton
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
        this.isSaving = false; // 👉 réactiver bouton même en cas d’erreur
      }
    })
  }

  fillPaymentMethod(item: CountryPayment) {
    this.editPayment = true
    this.errors = []
    this.itemToEdit = item
    this.countrySelected = item?.country
    this.typePaiement = item?.type_payment
    this.numberAccount = item?.account_nber
  }


  saveEditPayment() {
    this.isSaving = true; // 👉 désactiver bouton + afficher spinner
    const data = {
      countrySelected: this.countrySelected,
      typePaiement: this.typePaiement,
      numberAccount: this.numberAccount,
    }
    this.adminService.putPaymentBasedCountry(this.itemToEdit?.id, data).subscribe({
      next: (res: { result: CountryPayment }) => {
        this.errors = []
        this.countriesPayments = this.countriesPayments.filter((countryPayment: any) => countryPayment.id !== this.itemToEdit?.id)
        this.countriesPayments?.unshift(res?.result)
        this.countrySelected = 0
        this.typePaiement = 0
        this.numberAccount = ''
        this.isSaving = false; // 👉 réactiver bouton
        toastShow('success', '✅ Numéro de compte mis à jour');
        this.editPayment = false

      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
        this.isSaving = false; // 👉 réactiver bouton même en cas d’erreur
      }
    })
  }


  deletePayment(item: CountryPayment) {
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
        this.adminService.deletePaymentBasedCountry(item?.id).subscribe({
          next: () => {
            this.isSaving = false
            this.errors = []
            this.countriesPayments = this.countriesPayments.filter((countryPayment: any) => countryPayment.id !== item?.id)
            toastShow('success', '✅ Paiement supprimé');
          }
        })
      }
    });
  }

  // ***************************** Select city based on country selected ************************************ 
  choiceCountry() {
    const result = this.countries.find((obj: any) => obj?.name === this.formSetting.get('country')?.value);
    this.cities = result?.cities
  }


  // ***************************** Update the logo image ************************************
  onLogoChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.logoPreview = reader.result as string;
        // this.logo.name = file.name;
        // this.logo.file = reader.result;

        const data = {
          checker: 'logo',
          data: { logo: reader.result }
        };

        this.adminService.putAdminSetting(data).subscribe({
          next: () => {
            toastShow('success', '✅ Logo mis à jour avec succès');
            this.errors = [];
          },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error);
          }
        });
      };
      reader.onerror = (e) => {
        toastShow('error', '❌ Une erreur est survenue lors du chargement du logo.');
      };
    }
  }

}
