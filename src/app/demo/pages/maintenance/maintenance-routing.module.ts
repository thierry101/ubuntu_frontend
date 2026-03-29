// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error404',
        loadComponent: () => import('./maintain-error/maintain-error.component').then((c) => c.MaintainErrorComponent)
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./unauthorized/unauthorized.component').then((c) => c.UnauthorizedComponent)
      },
      {
        path: 'comingSoon',
        loadChildren: () => import('./coming-soon/coming-soon.module').then((m) => m.ComingSoonModule)
      },
      {
        path: 'constructor',
        loadComponent: () => import('./under-constructor/under-constructor.component').then((c) => c.UnderConstructorComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }
