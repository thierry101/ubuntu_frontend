/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { showError, slugifyTest, swalWithRedirect } from 'src/app/share/shared';
import { MyThemeComponent } from '../my-theme/my-theme.component';
import { LogoComponent } from '../logo/logo.component';
import { AdminService } from 'src/app/services/admin.service';
import { SelectedComponent } from "src/app/demo/application/reusableComponents/selected/selected.component";

@Component({
  selector: 'app-v1-register',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, MyThemeComponent, LogoComponent, SelectedComponent],
  templateUrl: './v1-register.component.html',
  styleUrls: ['./v1-register.component.scss']
})
export class V1RegisterComponent implements OnInit {
  formRegisterSeller !: FormGroup
  passwordType = 'password';
  show = false;
  country_emoji = '';
  country_phone_code = '';
  errors: any = []
  countries: any = []
  cities: any = [];
  isLoading = false;
  baseUrl: string = ''
  searchTerm: string = ""

  constructor(private fb: FormBuilder, private authService: AuthService, private route: Router, private adminService: AdminService) {
    this.formRegisterSeller = this.fb.group({
      country: '0',
      city: '0',
      email: '',
      entrpriseName: '',
      urlCatalog: '',
      code: '',
      phone: '',
      password: '',
      promoCode: '',
      acceptTerms: false
    })
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.authService.getInfoRegister().subscribe({
      next: (res: any) => {
        this.countries = res?.countries
        this.baseUrl = res?.base_url
      }
    })

    this.formRegisterSeller.get('entrpriseName')?.valueChanges.subscribe(value => {
      if (value) {
        const slug = slugifyTest(value);
        this.formRegisterSeller.get('urlCatalog')?.setValue(slug, { emitEvent: false });
      }
    });
  }


  searchCityBasedCountry(term: string) {
    console.log('clicked')
    this.searchTerm = term;
    this.adminService.getCitiesRegister(this.searchTerm, this.formRegisterSeller.get('country')?.value).subscribe({
      next: (res: any) => {
        this.cities = res
      }
    })
  }


  selectProduct(city: any): void {
    if (city?.name) {
      this.searchTerm = city?.name;
      this.formRegisterSeller.patchValue({
        city: city?.name,
      });
      this.clearCities()
    }
  }


  choiceCountry() {
    const country = this.countries.find((country: any) => country?.name == this.formRegisterSeller?.get('country')?.value)
    this.country_emoji = country?.emoji
    this.country_phone_code = country?.phone_code
    this.formRegisterSeller.patchValue({
      code: country?.phone_code
    })

    if (this.formRegisterSeller?.get('country')?.value) {
      this.searchTerm = ''
      this.formRegisterSeller.patchValue({
        city: ''
      })
    }
  }


  shPasswd() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.show = true;
    } else {
      this.passwordType = 'password';
      this.show = false;
    }
  }


  registerSeller() {
    if (this.formRegisterSeller.invalid) return;
    this.isLoading = true;
    const formData = this.formRegisterSeller?.getRawValue();

    this.authService.postRegister(formData).subscribe({
      next: () => {
        const email = this.formRegisterSeller.get('email')?.value;
        localStorage.setItem("email", email);

        this.isLoading = false;

        swalWithRedirect(
          "success",
          "Code envoyé",
          "✅ Un code vous a été envoyé par email. Veuillez le vérifier.",
          this.route.navigate(['/code-verification']),
          true // No need to allow outside click for this alert
        );
      },
      error: (error) => {
        this.isLoading = false;
        this.errors = error?.error?.errors;
        showError(error, error?.status, this.errors, error.error);
      }
    });
  }

  clearCities() {
    this.cities = []
  }


}
