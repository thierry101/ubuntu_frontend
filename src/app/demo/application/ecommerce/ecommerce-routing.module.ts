// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { accessBasedRoleGuard } from 'src/app/guards/access-based-role.guard';
import { rolePermissionGuard } from 'src/app/guards/role-permission.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home-client-promotion',
        loadComponent: () => import('./home-clients-promotion/home-clients-promotion.component').then((c) => c.HomeClientsPromotionComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_clients', 'handle_promotion', 'handle_discount_client'],
        },
      },
      {
        path: 'handle-expenses',
        loadComponent: () => import('./expenses/expenses.component').then((c) => c.ExpensesComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Daf'],
          requiredPermissions: ['handle_expenses'], //adapt to suit your needs
        },
      },
      {
        path: 'advertising-promotion',
        loadComponent: () => import('../../pages/articleManagement/advert/advert.component').then((c) => c.AdvertComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_advertising'],
        },
      },
      {
        path: 'calculate-profit',
        loadComponent: () => import('./calculate-profits/calculate-profits.component').then((c) => c.CalculateProfitsComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'Daf'])]
      },
      {
        path: 'home-finance',
        loadComponent: () => import('./finances/finances.component').then((c) => c.FinancesComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Daf'],
          requiredPermissions: ['view_supplier_debts', 'handle_expenses', 'handle_proforma'], //adapt to suit your needs
        },
      },
      {
        path: 'home-ecommerce',
        loadComponent: () => import('./ecommerce-menu/ecommerce-menu.component').then((c) => c.EcommerceMenuComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          // allowedRoles: ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Seller'],
          requiredPermissions: ['handle_ecommerce'], //adapt to suit your needs
        },

      }, {
        path: 'command-catalog',
        loadComponent: () => import('./commands-catalog/commands-catalog.component').then((c) => c.CommandsCatalogComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_ecommerce'], //adapt to suit your needs
        },

      },
      {
        path: 'catalog-setting',
        loadComponent: () => import('./catalog-products/catalog-products.component').then((c) => c.CatalogProductsComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_ecommerce'], //adapt to suit your needs
        },
      },
      {
        path: 'setting-catalog',
        loadComponent: () => import('./setting-catalog/setting-catalog.component').then((c) => c.SettingCatalogComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_ecommerce'], //adapt to suit your needs
        },
      },
      {
        path: 'invoice-proforma',
        loadComponent: () => import('./invoice-proforma/invoice-proforma.component').then((c) => c.InvoiceProformaComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Daf'],
          requiredPermissions: ['handle_proforma'], //adapt to suit your needs
        },
      },
      {
        path: 'credit-invoice',
        loadComponent: () => import('./credit-invoice/credit-invoice.component').then((c) => c.CreditInvoiceComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'Daf', 'SiteAdmin', 'Admin', 'Agency', 'Seller'])],
      },
      {
        path: 'checkout',
        loadComponent: () => import('./checkout/checkout.component').then((c) => c.CheckoutComponent),
        canActivate: [accessBasedRoleGuard(['siteAdmin', 'Agent', 'Agency', 'Seller', 'Admin'])]
      },
      {
        path: 'store-product',
        loadComponent: () => import('./store/store.component').then((c) => c.StoreComponent),
        canActivate: [accessBasedRoleGuard(['siteAdmin', 'Agent', 'Agency', 'Seller', 'Admin'])]
      },
      {
        path: 'sales-history',
        loadComponent: () => import('./historik/historik.component').then((c) => c.HistorikComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'siteAdmin', 'Agent', 'Agency', 'Seller', 'Daf'])]
      },
      {
        path: 'credit-monitoring',
        loadComponent: () => import('./deposit/deposit.component').then((c) => c.DepositComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'siteAdmin', 'Agent', 'Agency', 'Daf'])]
      },
      {
        path: 'error-open-hour',
        loadComponent: () => import('../reusableComponents/open-hour/open-hour.component').then((c) => c.OpenHourComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'siteAdmin', 'Agent', 'Agency', 'Seller'])]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }
