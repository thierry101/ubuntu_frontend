// Angular Imports
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { accessBasedRoleGuard } from './guards/access-based-role.guard';
import { rolePermissionGuard } from './guards/role-permission.guard';
import { authAccessGuard } from './guards/auth-access.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/my-profile',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Administrateur', 'Daf'],
          requiredPermissions: ['handle_dashboard'],
        },
      },
      {
        path: 'list-orders-warehouse/:id_wh_store',
        loadComponent: () => import('./demo/dashboard/list-orders/list-orders.component').then((c) => c.ListOrdersComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Administrateur', 'Daf'],
          requiredPermissions: ['handle_dashboard'],
        },
      },
      {
        path: 'analytics',
        loadComponent: () => import('./demo/dashboard/analytics/analytics.component').then((c) => c.AnalyticsComponent)
      },
      {
        path: '',
        loadChildren: () => import('./demo/application/user/user.module').then((m) => m.UserModule)
      },
      {
        path: '',
        loadChildren: () => import('./demo/application//ecommerce/ecommerce.module').then((m) => m.EcommerceModule)
      },
      {
        path: '',
        loadChildren: () => import('./demo/pages/articleManagement/article-management.module').then((m) => m.ArticleManagementModule)
      },
      {
        path: '',
        loadChildren: () => import('./demo/pages/inventory-management/inventory-management.module').then((m) => m.InventoryManagementModule)
      },
      {
        path: '',
        loadChildren: () => import('./demo/application/admins/admins-routing.module').then((m) => m.AdminsRoutingModule)
      },
      {
        path: '',
        loadChildren: () => import('./demo/pages/others/others.module').then((m) => m.OthersModule)
      },
      {
        path: 'settings',
        loadComponent: () => import('./demo/pages/settings/settings.component').then((c) => c.SettingsComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'Administrateur'])] // ✅ only allow admins
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./demo/pages/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
      },
      {
        path: '',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      },
      {
        path: 'contact-us',
        loadComponent: () => import('./demo/pages/contact-us/contact-us.component').then((c) => c.ContactUsComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./demo/pages/faq/faq.component').then((c) => c.FaqComponent),
        canActivate: [authAccessGuard]

      },
      {
        path: 'madette',
        loadComponent: () => import('./demo/pages/check-debt/check-debt.component').then((c) => c.CheckDebtComponent),

      },
      {
        path: 'private-policy',
        loadComponent: () => import('./demo/pages/prv-policy/prv-policy.component').then((c) => c.PrvPolicyComponent)
      },
      {
        path: 'facture/:name_invoice',
        loadComponent: () => import('./invoice/invoice.component').then((c) => c.InvoiceComponent),
        canActivate: [authAccessGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
