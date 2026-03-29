/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Enterprise } from 'src/app/interfaces/global';
import { RoleNamePipe } from 'src/app/pipes/role-name.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { PublicService } from 'src/app/services/public.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-home-stock',
  standalone: true,
  imports: [SharedModule, RouterModule, RoleNamePipe],
  templateUrl: './home-stock.component.html',
  styleUrls: ['./home-stock.component.scss']
})
export class HomeStockComponent implements OnInit {
  userInfo: any;
  permissions: string[] = [];
  role: string = '';
  adminHasWarehouse: boolean = false;
  infoEnterprise!: Enterprise;
  nber_wh_stores: number = 0

  all_roles: string[] = ['Admin', 'siteAdmin', 'Agent', 'Agency'];
  all_roles2: string[] = ['siteAdmin', 'Agent', 'Agency'];

  constructor(private authService: AuthService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getRole;
    this.role = this.userInfo?.role;
    if (this.role === 'Admin') {
      this.adminHasWarehouse = !!this.userInfo.whStor;
    }

    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.infoEnterprise = res;
      }
    });

    this.authService.getPermissions().subscribe({
      next: (res: any) => {
        this.nber_wh_stores = res?.nber_wh_stores
        this.permissions = res?.result ?? [];
      },
      error: err => {
        console.error("❌ Failed to load permissions:", err);
      }
    });
  }

  hasAnyAccess(): boolean { //Cette permission donne accès à l'ensemble des cards menu de la table et dans chaque cart menu il y'a une autre permission
    return (
      this.role === 'siteAdmin' ||
      this.all_roles.includes(this.role) ||
      this.all_roles2.includes(this.role) ||
      ['handle_stock', 'handle_trash', 'historik_transfert', 'watch_trash_prod'].some(p => this.permissions?.includes(p))
    );
  }
}
