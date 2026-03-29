// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'comingSoon-1',
        loadComponent: () => import('./coming-soon-v1/coming-soon-v1.component').then((c) => c.ComingSoonV1Component)
      },
      {
        path: 'comingSoon-2',
        loadComponent: () => import('./coming-soon-v2/coming-soon-v2.component').then((c) => c.ComingSoonV2Component)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComingSoonRoutingModule {}
