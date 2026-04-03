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
        path: 'home-users-permissions',
        loadComponent: () => import('../home-users/home-users.component').then((c) => c.HomeUsersComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['handle_users'],
        },
      },
      {
        path: 'handle-users',
        loadComponent: () => import('./list-style-v2/list-style-v2.component').then((c) => c.ListStyleV2Component),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['handle_users'],
        },
      },
      {
        path: 'handle-clients',
        loadComponent: () => import('../clients/clients.component').then((c) => c.ClientsComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['handle_clients'],
        },
      },
      {
        path: 'detail-client/:id',
        loadComponent: () => import('../detail-client/detail-client.component').then((c) => c.DetailClientComponent),
        canActivate: [rolePermissionGuard()],
        data: {
          allowedRoles: ['Admin', 'Administrateur'],
          requiredPermissions: ['handle_clients'],
        },
      },
      {
        path: 'handle-permissions',
        loadComponent: () => import('./list-permissions/list-permissions.component').then((c) => c.ListPermissionsComponent),
        canActivate: [accessBasedRoleGuard(['Admin', 'Administrateur'])] // ✅ only allow admins
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListRoutingModule { }
