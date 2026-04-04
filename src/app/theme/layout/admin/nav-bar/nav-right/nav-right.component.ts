/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// project import

// third party
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { otherRoles, roles } from 'src/app/share/shared';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {
  user?: null;
  userInfo!: any
  imgProfile: string = ''
  role: string = ''
  hasAccess: boolean = false;
  hasAccessInvoice: boolean = false;
  adminHasWarehouse: boolean = false;
  url: string = environment.siteUrlMedia;
  permissions!: any
  currentTime!: any


  // constructor
  constructor(private translate: TranslateService, private authService: AuthService, private route: Router) { }

  ngOnInit(): void {
    setInterval(() => {
      const now = new Date();

      this.currentTime =
        now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0') + ':' +
        now.getSeconds().toString().padStart(2, '0');

    }, 1000);

    const allowedRoles = ['siteAdmin', 'Agent', 'Agency', 'Seller'];
    const allowedRolesInvoice = ['Admin', 'Daf'];
    this.userInfo = this.authService?.currentUser
    this.role = this.userInfo?.role
    if (this.role === 'Admin') {
      this.adminHasWarehouse = !!this.userInfo.whStore;
    }
    this.hasAccess = allowedRoles.includes(this.role);
    this.hasAccessInvoice = allowedRolesInvoice.includes(this.role);
    this.imgProfile = this.userInfo?.userProfile ? this.url + this.userInfo.userProfile : 'assets/images/gallery.jpg';
    this.permissions = this.authService.currentPermissions || [];
  }


  logout() {
    this.clearUserSession();

    this.authService.logout().subscribe({
      next: () => {
        this.route.navigate(['/login']);
      },
      error: () => {
        this.route.navigate(['/login']);
      }
    });
  }


  getRoleName(value: string) {
    const role = roles.find(r => r?.value === value) || otherRoles.find(r => r?.value === value);
    return role?.name ?? "Rôle inconnu";
  }

  private clearUserSession() {
    localStorage.clear()
    document.cookie = "userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }


  // user according language change of sidebar menu item
  useLanguage(language: string) {
    this.translate.use(language);
  }

  notification = [
    {
      images: 'assets/images/user/avatar-2.jpg',
      background: 'bg-light-success',
      icon: 'ti ti-building-store',
      title: 'John Doe',
      time: '2 min ago',
      text: 'It is a long established fact that a reader will be distracted',
      badgeType: true,
      mailType: false,
      imagesType: false,
      conformation: false,
      iconType: false
    },
    {
      images: 'assets/images/user/avatar-2.jpg',
      background: 'bg-light-success',
      icon: 'ti ti-building-store',
      title: 'Store Verification Done',
      time: '3 min ago',
      text: 'We have successfully received your request.',
      badgeType: true,
      mailType: false,
      imagesType: false,
      conformation: false,
      iconType: true
    },
    {
      images: 'assets/images/user/avatar-2.jpg',
      background: 'bg-light-primary',
      icon: 'ti ti-mailbox',
      title: 'Check Your Mail.',
      time: '5 min ago',
      text: "All done! Now check your inbox as you're in for a sweet treat!",
      badgeType: false,
      mailType: true,
      imagesType: false,
      conformation: false,
      iconType: true
    },
    {
      images: 'assets/images/user/avatar-2.jpg',
      background: 'bg-light-success',
      icon: 'ti ti-building-store',
      title: 'John Doe',
      time: '8 min ago',
      text: 'Uploaded two file on 21Jan 2020',
      badgeType: false,
      mailType: false,
      imagesType: true,
      conformation: false,
      iconType: false
    },
    {
      images: 'assets/images/user/avatar-3.jpg',
      background: 'bg-light-success',
      icon: 'ti ti-building-store',
      title: 'John Doe',
      time: '10 min ago',
      text: 'It is a long established fact that a reader will be distracted',
      badgeType: false,
      mailType: false,
      imagesType: false,
      conformation: true,
      iconType: false
    }
  ];
}
