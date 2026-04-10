import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { rolePermissionGuard } from 'src/app/guards/role-permission.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home-product',
        loadComponent: () => import('./home-product/home-product.component').then((c) => c.HomeProductComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_provider', 'handle_categories', 'handle_products'], //edit this guard to acccept array of permissions
        },
      },
      {
        path: 'handle-providers',
        loadComponent: () => import('./providers/providers.component').then((c) => c.ProvidersComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_provider'],
        },
      },
      {
        path: 'handle-store-warehouse',
        loadComponent: () => import('./store-wh/store-wh.component').then((c) => c.StoreWhComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_stores_wh'],
        },
      },
      {
        path: 'handle-sub-and-category',
        loadComponent: () => import('./cat-subcategories/cat-subcategories.component').then((c) => c.CatSubcategoriesComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_categories'],
        },
      },
      {
        path: 'handle-products',
        loadComponent: () => import('./articles/articles.component').then((c) => c.ArticlesComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_products'],
        },
      },
      {
        path: 'products-in-warehouse',
        loadComponent: () => import('./articles-in-stock/articles-in-stock.component').then((c) => c.ArticlesInStockComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'siteAdmin', 'Agency'],
          requiredPermissions: ['watch_stock'],
        },
      },
      {
        path: 'input-invoice',
        loadComponent: () => import('./input-invoice/input-invoice.component').then((c) => c.InputInvoiceComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'siteAdmin', 'Daf'],
          requiredPermissions: ['view_supplier_debts'],
        },
      },
      {
        path: 'setting-promotion',
        loadComponent: () => import('./setting-promotion/setting-promotion.component').then((c) => c.SettingPromotionComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_promotion'],
        },
      },
      {
        path: 'promotion',
        loadComponent: () => import('./promotions/promotions.component').then((c) => c.PromotionsComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_promotion'],
        },
      },
      {
        path: 'discount-client',
        loadComponent: () => import('./discount-client/discount-client.component').then((c) => c.DiscountClientComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin'],
          requiredPermissions: ['handle_discount_client'],
        },
      },
        {
        path: 'my-invoices',
        loadComponent: () => import('../invoices/invoices.component').then((c) => c.InvoicesComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Daf'],
          requiredPermissions: [''],
        },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticleManagementRoutingModule { }
