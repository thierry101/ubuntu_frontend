/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Enterprise, Partner } from 'src/app/interfaces/global';
import { PartnerService } from 'src/app/services/partner.service';
import { setPagination, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [SharedModule, SpinnersComponent, SetPaginationComponent, RouterLink],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export class PartnersComponent implements OnInit {

  formSettingPartner!: FormGroup
  settingPartner!: Partner
  partner!: Partner
  errors: any = [];
  searchTerm: string = ''
  isLoading: boolean = false
  loading: boolean = false
  pages: number[] = [];
  all_enterprises: Enterprise[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  constructor(private partnerService: PartnerService, private fb: FormBuilder) {
    this.formSettingPartner = this.fb.group({
      promoCode: '',
      commission: '',
      mobileMoney: '',
      typeReduction: '',
      amoutReduction: '',
      percentagReduction: '',
      nberInvoice: '',
      statutPartner: '',
    })
  }

  ngOnInit(): void {
    this.fetchEnterprisesPartner(1)
    this.loading = true
    this.partnerService.getSettingPartner().subscribe({
      next: (res: { result: Partner }) => {
        this.loading = false
        this.partner = res?.result
        this.settingPartner = res?.result
        this.formSettingPartner.patchValue({
          promoCode: this.settingPartner?.code_promo || '',
          commission: this.settingPartner?.percentage_negociate || 0,
          mobileMoney: this.settingPartner?.phone_mobile_money || '',
          typeReduction: this.settingPartner?.type_reduction || 0,
          amoutReduction: this.settingPartner?.amount_reduction || 0,
          percentagReduction: this.settingPartner?.percentage_reduction || 0,
          nberInvoice: this.settingPartner?.timing_applying || 0,
          statutPartner: this.settingPartner?.statut
        })
      }
    })
  }

  fetchEnterprisesPartner(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.partnerService.enterprisePartner.bind(this.partnerService) as (page: number, searchTerm: any,) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.all_enterprises = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchEnterprisesPartner(page);
  }

  onSubmit() {
    this.loading = true
    this.partnerService.putSettingPartner(this.formSettingPartner?.value).subscribe({
      next: () => {
        this.errors = []
        this.loading = false
        toastShow("success", "✅ Paramètre mis à jour")
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.loading = false
        showError(err, err.status, this.errors, err.error);
      }
    })
  }



}
