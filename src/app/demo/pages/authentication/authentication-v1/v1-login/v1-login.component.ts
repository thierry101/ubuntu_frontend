/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth.service';
import { showError } from 'src/app/share/shared';
import { MyThemeComponent } from '../my-theme/my-theme.component';
import { LogoComponent } from '../logo/logo.component';

// rxjs library

@Component({
  selector: 'app-v1-login',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, MyThemeComponent, LogoComponent],
  templateUrl: './v1-login.component.html',
  styleUrls: ['./v1-login.component.scss']
})
export class V1LoginComponent implements OnInit {
  // public method

  loginForm!: FormGroup;
  errors: any = []
  loading = false;
  submitted = false;
  error = '';
  returnUrl!: string;
  role: string = ''
  classList!: { toggle: (arg0: string) => void };

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // redirect to home if already logged in

  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });



    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    // returnUrl uniquement s'il existe vraiment
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
  }

  // convenience getter for easy access to form fields
  get formValues() {
    return this.loginForm.controls;
  }

  togglePassword() {
    const password = document.querySelector('#password');
    const type = password?.getAttribute('type') === 'password' ? 'text' : 'password';
    password?.setAttribute('type', type);

    // toggle the icon
    this.classList?.toggle('ti-eye-off');
  }

  onSubmit() {
    const loginData = this.loginForm?.getRawValue();

    this.authService.apiLogin(loginData).subscribe({
      next: (res: { access: string; userInfo: string }) => {
        // ✅ Store tokens
        this.authService.setAccessToken(res?.access);
        this.authService.storeTokenInCookie('userInfo', res?.userInfo);

        // ✅ Get user role
        const role = this.authService.getRole?.role;

        // ✅ Optional Security: allow only internal URLs
        if (this.returnUrl && this.returnUrl.startsWith('/')) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }

        // ✅ Cleaner role-based redirection
        const roleRedirectMap: Record<string, string> = {
          Admin: '/dashboard',
          Daf: '/dashboard',
          siteAdmin: '/inventory-management',
          Agent: '/list-all-stocks',
          Agency: '/list-all-stocks',
          Seller: '/store-product',
          Partner: '/space-partner',
          big_root: '/list-all-partners',
        };

        this.router.navigate([roleRedirectMap[role] || '/']);
      },
      error: (error) => {
        this.errors = error?.error?.errors;
        showError(error, error?.status, this.errors, error.error);
      }
    });
  }

}
