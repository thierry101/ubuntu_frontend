/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogoComponent } from 'src/app/demo/pages/authentication/authentication-v1/logo/logo.component';
import { MyThemeComponent } from "src/app/demo/pages/authentication/authentication-v1/my-theme/my-theme.component";
import { PartnerService } from 'src/app/services/partner.service';
import { countries } from 'src/app/share/countries';
import { showError, SwallModal } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-partners-register',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, MyThemeComponent, LogoComponent],
  templateUrl: './partners-register.component.html',
  styleUrl: './partners-register.component.scss'
})
export class PartnersRegisterComponent implements OnInit {
  loginPartnerForm!: FormGroup
  country_emoji = '';
  country_phone_code = '';
  errors: any = []
  countries: any = []
  cities: any = [];
  isLoading: boolean = false

  constructor(private fb: FormBuilder, private partnerService: PartnerService) { }

  ngOnInit(): void {
    this.countries = countries
    this.loginPartnerForm = this.fb.group({
      email: '',
      name: '',
      surname: '',
      phone: '',
      country: '0',
      city: '0',
      code: '',
    })
  }

  choiceCountry() {
    const country = this.countries.find((country: any) => country.name == this.loginPartnerForm?.get('country')?.value)
    this.cities = country?.cities
    this.country_emoji = country?.emoji
    this.country_phone_code = country?.phone_code
    this.loginPartnerForm.patchValue({
      code: country?.phone_code
    })
  }


  onSubmit() {
    this.isLoading = true
    this.partnerService.postRegisterPartner(this.loginPartnerForm?.value).subscribe({
      next: () => {
        this.isLoading = false
        this.loginPartnerForm.patchValue({
          email: '',
          name: '',
          surname: '',
          phone: '',
          country: '0',
          city: '0',
          code: '',
        })
        this.errors = []
        SwallModal("success", "Succès", "✅ Votre demande a été bien envoyée. Nous vous contacterons dès que possible.")
      },
      error: (error) => {
        this.isLoading = false;
        this.errors = error?.error?.errors;
        showError(error, error?.status, this.errors, error.error);
      }
    })
  }

}
