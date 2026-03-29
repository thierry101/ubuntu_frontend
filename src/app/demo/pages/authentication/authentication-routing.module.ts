// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [ 
      {
        path: '',
        loadChildren: () => import('./authentication-v1/authentication-v1.module').then((m) => m.AuthenticationV1Module)
      },
      {
          path: 'register-space-partner',
          loadComponent: () => import('./partners-register/partners-register.component').then((c) => c.PartnersRegisterComponent),
        },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
