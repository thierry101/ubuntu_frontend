/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth.service';
import { showError, toastShow } from 'src/app/share/shared';
import { MyThemeComponent } from '../my-theme/my-theme.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-v1-fr-password',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, MyThemeComponent, LogoComponent],
  templateUrl: './v1-fr-password.component.html',
  styleUrls: ['./v1-fr-password.component.scss']
})
export class V1FrPasswordComponent implements OnInit {
  email !: string;
  errors: any = []
  
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  sendEmailToResetPassword() {
    const data = {
      email: this.email,
      url_website: `${window.location.origin}/resetpassword`
    };

    this.authService.postResetPassword(data).subscribe({
      next: () => {
        toastShow("success", "✅ Un code vous a été envoyé par email. Veuillez le vérifier.");
        this.errors = [];
        this.email = '';
      },
      error: (error) => {
        this.errors = error?.error?.errors;
        showError(error, error?.status, this.errors, error.error);
      }
    });
  }

}
