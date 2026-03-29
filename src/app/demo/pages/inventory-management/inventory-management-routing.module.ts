import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { accessBasedRoleGuard } from 'src/app/guards/access-based-role.guard';
import { rolePermissionGuard } from 'src/app/guards/role-permission.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home-stock',
        loadComponent: () => import('./home-stock/home-stock.component').then((c) => c.HomeStockComponent),
        canActivate: [rolePermissionGuard],
        data: {
          allowedRoles: ['Admin', 'Administrateur', 'siteAdmin', 'Agent', 'Agency'],
          requiredPermissions: ['watch_stock', 'handle_stock', 'handle_trash', 'historik_transfert', 'historik_transfert', 'watch_trash_prod'], //edit this guard to acccept array of permissions
        },
      },
      {
        path: 'inventory-management',
        loadComponent: () => import('./stock-in/stock-in.component').then((c) => c.StockInComponent),
        canActivate: [accessBasedRoleGuard(['siteAdmin', "Admin"])] // ✅ only allow siteAdmin(resposable magasin central)
      },
      {
        path: 'inventory-validate',
        loadComponent: () => import('./valid-inventory/valid-inventory.component').then((c) => c.ValidInventoryComponent),
        canActivate: [rolePermissionGuard],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['handle_stock'],
        },
      },
      {
        path: 'trash-validate',
        loadComponent: () => import('./trash-product/trash-product.component').then((c) => c.TrashProductComponent),
        canActivate: [rolePermissionGuard],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['handle_trash'],
        },
      },
       {
        path: 'my-trash',
        loadComponent: () => import('./my-trash/my-trash.component').then((c) => c.MyTrashComponent),
        canActivate: [rolePermissionGuard],
        data: {
          allowedRoles: ['Admin', 'siteAdmin', 'Agent', 'Agency'],
          requiredPermissions: ['watch_trash_prod'],
        }, // ✅ only allow Responsable magasin central et secondaire et chef d'agence
      },
      {
        path: 'valid-product', //<!-- all-validation-items and valid-product use the same template -->
        loadComponent: () => import('./valid-transfert/valid-transfert.component').then((c) => c.ValidTransfertComponent),
        canActivate: [accessBasedRoleGuard(['siteAdmin', 'Agent', 'Agency', 'Admin'])] // ✅ only allow Responsable magasin central et secondaire et chef d'agence
      },
      {
        path: 'historik-validation-items',//<!-- all-validation-items and valid-product use the same template -->
        loadComponent: () => import('./valid-transfert/valid-transfert.component').then((c) => c.ValidTransfertComponent),
        canActivate: [rolePermissionGuard],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['historik_transfert'],
        },
      },
      {
        path: 'transfert-product',
        loadComponent: () => import('./view-transfert/view-transfert.component').then((c) => c.ViewTransfertComponent),
        canActivate: [accessBasedRoleGuard(['siteAdmin', 'Agent', 'Agency', 'Admin'])]
      },
      
      {
        path: 'adjust-stock',
        loadComponent: () => import('./adjust-stock/adjust-stock.component').then((c) => c.AdjustStockComponent),
        canActivate: [rolePermissionGuard],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['adjust_stock', 'view_adjustments_stock'],
        },
      },
      {
        path: 'list-all-stocks',
        loadComponent: () => import('./list-stock/list-stock.component').then((c) => c.ListStockComponent),
        canActivate: [accessBasedRoleGuard(['Agent', 'Agency', 'Admin'])] // ✅ only allow admins
      },
      {
        path: 'list-stock-movement',
        loadComponent: () => import('./mvt-stock/mvt-stock.component').then((c) => c.MvtStockComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'siteAdmin', 'Agent', 'Agency'])] // ✅ only allow admins
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryManagementRoutingModule { }
