/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth.service';
import { showError, toastShow } from 'src/app/share/shared';
import { MyThemeComponent } from '../my-theme/my-theme.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-v1-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, MyThemeComponent, LogoComponent],
  templateUrl: './v1-reset-password.component.html',
  styleUrls: ['./v1-reset-password.component.scss']
})
export class V1ResetPasswordComponent {
  newPassword: string = '';
  uid: string = '';
  token: string = '';
  passwordType = 'password';
  errors: any = []

  constructor(private authService: AuthService, private router: ActivatedRoute, private route: Router) {
    this.router.paramMap.subscribe({
      next: (params) => {
        this.uid = params.get('uid') || '';
        this.token = params.get('token') || '';
      },
      error: (err) => {
        console.error('Erreur lors de la lecture des paramètres de la route :', err);
        // Optionally handle routing error
      }
    });

  }

  setNewPassword() {
    const data = {
      password: this.newPassword
    };

    this.authService.postSetNewPassword(data, this.uid, this.token).subscribe({
      next: () => {
        toastShow("success", "✅ Mot de passe changé avec succès");
        this.route.navigate(['/login']);
      },
      error: (error) => {
        this.errors = error?.error?.errors;
        showError(error, error?.status, this.errors, error.error);
      }
    });
  }


  shPasswd() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }
}
