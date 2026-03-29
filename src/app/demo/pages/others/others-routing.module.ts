import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { accessBasedRoleGuard } from 'src/app/guards/access-based-role.guard';

const routes: Routes = [
   {
      path: '',
      children: [
        {
          path: 'audit-log',
          loadComponent: () => import('./audit-log/audit-log.component').then((c) => c.AuditLogComponent),
          canActivate: [accessBasedRoleGuard(['Admin', 'Administrateur'])] // ✅ only allow siteAdmin(resposable magasin central)
        },
        // {
        //   path: 'inventory-validate',
        //   loadComponent: () => import('./valid-inventory/valid-inventory.component').then((c) => c.ValidInventoryComponent),
        //   canActivate: [authAccessGuard] // ✅
        // },
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OthersRoutingModule { }
