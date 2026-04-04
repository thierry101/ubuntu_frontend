// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authAccessGuard } from 'src/app/guards/auth-access.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'my-profile',
        loadComponent: () => import('./profile-one/profile-one.component').then((c) => c.ProfileOneComponent),
        canActivate: [authAccessGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountProfileRoutingModule {}

