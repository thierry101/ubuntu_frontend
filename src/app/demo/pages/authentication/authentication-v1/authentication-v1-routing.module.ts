// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authRedirectGuard } from 'src/app/guards/auth-redirect.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./v1-login/v1-login.component').then((c) => c.V1LoginComponent),
        canActivate: [authRedirectGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./v1-register/v1-register.component').then((c) => c.V1RegisterComponent),
        canActivate: [authRedirectGuard]
      },
      {
        path: 'forgetPassword',
        loadComponent: () => import('./v1-fr-password/v1-fr-password.component').then((c) => c.V1FrPasswordComponent),
        canActivate: [authRedirectGuard]
      },
      {
        path: 'resetpassword/:uid/:token',
        loadComponent: () => import('./v1-reset-password/v1-reset-password.component').then((c) => c.V1ResetPasswordComponent),
        canActivate: [authRedirectGuard]
      },
      {
        path: 'code-verification',
        loadComponent: () => import('./v1-code-verify/v1-code-verify.component').then((c) => c.V1CodeVerifyComponent),
        canActivate: [authRedirectGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationV1RoutingModule {}
