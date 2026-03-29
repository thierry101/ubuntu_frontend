/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Partner } from 'src/app/interfaces/global';
import { PartnerService } from 'src/app/services/partner.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { countries } from 'src/app/share/countries';
import { QuillModule } from 'ngx-quill';
import { SubmitSpinnerComponent } from "../../reusableComponents/submit-spinner/submit-spinner.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-partners',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SpinnersComponent, QuillModule, SubmitSpinnerComponent, SearchListComponent],
  templateUrl: './list-partners.component.html',
  styleUrl: './list-partners.component.scss'
})
export class ListPartnersComponent implements OnInit {
  formPartner!: FormGroup
  isLoading: boolean = false
  isSaving: boolean = false
  searchTerm: string = ''
  titleModal: string = ''
  startDate: string = ''
  endDate: string = ''
  pages: number[] = [];
  all_partners: Partner[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  editParner: boolean = false
  errors!: any
  countries: any = []
  cities: any = []
  itemToEdit!: Partner

  constructor(private partnerService: PartnerService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.countries = countries
    this.fetchPartners(1)
    this.formPartner = this.fb.group({
      name: '',
      surname: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      codePromo: '',
      partnerPercentag: 0,
      reasonRejection: '',
      percentagReduction: 0,
      timingApplication: 1,
      statutPartner: 0,
      setByUs: false
    })
  }


  resetFormPartner() {
    this.editParner = false
    this.errors = []
    this.titleModal = "Enregistrer un partenaire"
    this.formPartner.patchValue({
      name: '',
      surname: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      codePromo: '',
      partnerPercentag: 0,
      reasonRejection: '',
      percentagReduction: 0,
      timingApplication: 1,
      statutPartner: 1,
      setByUs: false
    })
  }


  fetchPartners(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.partnerService.getRegisterPartner.bind(this.partnerService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.all_partners = data?.listItems;
        // console.log(this.all_partners)
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchPartners(page);
  }

  fillModal(partner: Partner) {
    this.editParner = true
    this.titleModal = "Détails du partenaire"
    this.errors = []
    this.itemToEdit = partner
    this.formPartner.patchValue({
      name: partner?.name,
      surname: partner?.surname,
      email: partner?.email,
      phone: partner?.phone,
      country: partner?.country,
      city: partner?.city,
      codePromo: partner?.code_promo || '',
      percentagReduction: partner?.percentage_reduction || 0,
      partnerPercentag: partner?.percentage_negociate || 0,
      timingApplication: partner?.timing_applying || 1,
      reasonRejection: partner?.reasonRejection || '',
      statutPartner: partner?.statut,
      setByUs: partner?.set_by_us
    })
    const result = this.countries.find((obj: any) => obj?.name === partner?.country);
    this.cities = result?.cities || [];
  }

  valueOfStatus(event: any) {
    this.formPartner.patchValue({
      statutPartner: parseInt(event.target.value)
    })
  }


  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchPartners(1);
  }


  updatePartner() {
    this.isSaving = true
    const idModal = document.getElementById('idModalPartner002')
    this.partnerService.putRegisterPartner(this.formPartner?.value, this.itemToEdit?.id).subscribe({
      next: (res: { result: Partner }) => {
        this.all_partners = this.all_partners.filter((partner: any) => partner.id !== this.itemToEdit?.id)
        this.all_partners?.unshift(res?.result)
        idModal?.click()
        this.isSaving = false
        toastShow("success", "✅ Partenaire modifié")

      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }

  deletePartner(idPartner: number) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr de vouloir supprimer ce partenaire ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.partnerService.deleteRegisterPartner(idPartner).subscribe({
          next: () => {
            this.errors = []
            this.all_partners = this.all_partners.filter((partner: any) => partner.id !== idPartner)
            toastShow("success", "✅ Partenaire supprimé")
          }
        })
      }
    });
  }


  // ***************************** Select city based on country selected ************************************
  choiceCountry() {
    const result = this.countries.find((obj: any) => obj?.name === this.formPartner.get('country')?.value);
    this.cities = result?.cities
  }


}
