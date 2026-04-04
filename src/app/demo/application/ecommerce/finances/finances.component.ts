/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.scss'
})
export class FinancesComponent implements OnInit {
  // all_roles: string[] = ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Daf'];
  permissions: string[] = [];
  userInfo: any;
  role: string = '';
  hasRole: boolean = true
  allRoles!: any
  allRoles2!: any

  constructor(private authService: AuthService) {
    this.permissions = this.authService.currentPermissions || [];
  }

  ngOnInit(): void {
    this.allRoles = ['Admin', 'siteAdmin', 'Agent', 'Agency', 'Daf']
    this.allRoles2 = ['Admin', 'siteAdmin', 'Daf']
    this.userInfo = this.authService.currentUser;
    this.role = this.userInfo?.role;
    this.hasRole = this.allRoles.includes(this.role)


  }


  hasAnyAccess(): boolean {
    return (
      this.allRoles.includes(this.role) ||
      ['handle_clients', 'handle_promotion', 'handle_discount_client'].some(p => this.permissions?.includes(p))
    );
  }

}
