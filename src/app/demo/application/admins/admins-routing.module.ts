import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { accessBasedRoleGuard } from 'src/app/guards/access-based-role.guard';


const routes: Routes = [
  {
    path: 'space-partner',
    loadComponent: () => import('./partners/partners.component').then((c) => c.PartnersComponent),
    canActivate: [accessBasedRoleGuard(['Partner'])]
  },
  {
    path: 'list-commission',
    loadComponent: () => import('./partners-commission/partners-commission.component').then((c) => c.PartnersCommissionComponent),
    canActivate: [accessBasedRoleGuard(['Partner'])]
  },
  {
    path: 'all-invoices-enterprises',
    loadComponent: () => import('./partners-commission/partners-commission.component').then((c) => c.PartnersCommissionComponent),
    canActivate: [accessBasedRoleGuard(['big_root'])]
  },
  {
    path: 'admin-faq',
    loadComponent: () => import('./payment-partner/payment-partner.component').then((c) => c.PaymentPartnerComponent),
    canActivate: [accessBasedRoleGuard(['big_root'])]
  },
  {
    path: 'track-payment-enterprise/:idEnterprise',
    loadComponent: () => import('./partners/detail-payment/detail-payment.component').then((c) => c.DetailPaymentComponent),
    canActivate: [accessBasedRoleGuard(['Partner'])]
  },
  {
    path: 'list-all-partners',
    loadComponent: () => import('./list-partners/list-partners.component').then((c) => c.ListPartnersComponent),
    canActivate: [accessBasedRoleGuard(['big_root'])]
  },
  {
    path: 'list-all-enterprises',
    loadComponent: () => import('./list-enterprises/list-enterprises.component').then((c) => c.ListEnterprisesComponent),
    canActivate: [accessBasedRoleGuard(['big_root'])]
  },
  {
    path: 'global-setting',
    loadComponent: () => import('./global-setting/global-setting.component').then((c) => c.GlobalSettingComponent),
    canActivate: [accessBasedRoleGuard(['big_root'])]
  },
  {
    path: 'upload-country-city',
    loadComponent: () => import('./upload-country/upload-country.component').then((c) => c.UploadCountryComponent),
    canActivate: [accessBasedRoleGuard(['big_root'])]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsRoutingModule { }
