/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoleNamePipe } from 'src/app/pipes/role-name.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-home-product',
  standalone: true,
  imports: [SharedModule, RouterModule, RoleNamePipe],
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
    this.userInfo = this.authService.getRole;
    this.role = this.userInfo?.role;

    this.authService.getPermissions().subscribe({
      next: (res: any) => {
        this.permissions = res?.result ?? [];
      },
      error: err => {
        console.error("❌ Failed to load permissions:", err);
      }
    });
  }

  hasAnyAccess(): boolean {
    return (
      this.all_roles.includes(this.role)) ||
      ['handle_categories', 'handle_products', 'handle_provider'].some(p => this.permissions?.includes(p))
  }
}
