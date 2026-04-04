/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, Input, OnInit } from '@angular/core';

// Project import
import { NavigationItem } from '../../navigation';
import { BerryConfig } from 'src/app/app-config';
import { CustomsThemeService } from 'src/app/theme/shared/service/customs-theme.service';
import { AuthService } from 'src/app/services/auth.service';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit {
  // public props
  @Input() item!: NavigationItem;
  currentLayout!: string;
  role: string = ''
  userInfo: any;
  permissions!: any
  hasUserOrProductPerm: boolean = false;
  checkRoleUsr: boolean = false;
  adminHasWarehouse: boolean = false

  // Constructor
  constructor(private menuService: MenuService,
    public theme: CustomsThemeService, private authService: AuthService
  ) {
    this.currentLayout = BerryConfig.layout;
  }

  
  ngOnInit() {
    const requiredPerms = this.item?.permissions;
    this.theme.customMenuType.subscribe((layout: string) => {
      this.currentLayout = layout;
    });
    this.userInfo = this.authService?.currentUser
    this.isAdminWithWarehouse(this.userInfo)
    this.role = this.userInfo?.role
    this.checkRoleUsr = this.item?.roles?.includes(this.role)
    this.permissions = this.authService?.currentPermissions || []
    this.hasUserOrProductPerm = requiredPerms?.some((perm: any) => this.permissions?.includes(perm));
  }


  // Vérifie si l'utilisateur est Admin et qu'il a un whStor défini
  isAdminWithWarehouse(userInfo: any) {
    // console.log("the boolean is", userInfo.role === 'Admin' && !!userInfo.whStor)
    this.adminHasWarehouse = userInfo.role === 'Admin' && !!userInfo.whStor;
  }


  closeOtherMenu(event: MouseEvent) {
    this.menuService.closeOtherMenu(event);

  }

  subMenuCollapse() {
    if ((document.querySelector('app-navigation.coded-navbar') as HTMLDivElement).classList.contains('coded-trigger')) {
      (document.querySelector('app-navigation.coded-navbar') as HTMLDivElement).classList.remove('coded-trigger');
    }
  }
}
