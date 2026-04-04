/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-home-product',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './home-product.component.html',
  styleUrl: './home-product.component.scss'
})
export class HomeProductComponent implements OnInit {
  userInfo: any;
  permissions: string[] = [];
  role: string = '';

  all_roles: string[] = ['Admin', 'siteAdmin', 'Agent', 'Agency'];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userInfo = this.authService.currentUser;
    this.role = this.userInfo?.role;
    this.permissions = this.authService.currentPermissions || [];
  }

  hasAnyAccess(): boolean {
    return (
      this.all_roles.includes(this.role)) ||
      ['handle_categories', 'handle_products', 'handle_provider'].some(p => this.permissions?.includes(p))
  }
}
