/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-ecommerce-menu',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './ecommerce-menu.component.html',
  styleUrl: './ecommerce-menu.component.scss'
})
export class EcommerceMenuComponent implements OnInit {
  all_roles: string[] = ['Admin', 'siteAdmin', 'Agent', 'Agency'];
  permissions: string[] = [];
  role: string = '';
  userInfo: any;
  hasRole:boolean=true
  allRoles!:any


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.allRoles = ['Admin']
    this.userInfo = this.authService.currentUser;
    this.role = this.userInfo?.role;
    this.hasRole = this.allRoles.includes(this.role)
    this.permissions = this.authService.currentPermissions
    console.log(this.permissions)
  }

  hasAnyAccess(): boolean {
    return (
      this.all_roles.includes(this.role) ||
      ['handle_clients', 'handle_promotion', 'handle_discount_client'].some(p => this.permissions?.includes(p))
    );
  }
}
