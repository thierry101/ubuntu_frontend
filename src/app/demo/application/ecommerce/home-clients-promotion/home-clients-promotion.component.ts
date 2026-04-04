/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-home-clients-promotion',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './home-clients-promotion.component.html',
  styleUrl: './home-clients-promotion.component.scss'
})
export class HomeClientsPromotionComponent implements OnInit {
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
      this.all_roles.includes(this.role) ||
      ['handle_clients', 'handle_promotion', 'handle_discount_client'].some(p => this.permissions?.includes(p))
    );
  }
}
