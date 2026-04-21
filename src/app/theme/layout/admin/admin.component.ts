/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';

// Project import
import { BerryConfig } from 'src/app/app-config';
import { CustomsThemeService } from '../../shared/service/customs-theme.service';
import { MenuService } from 'src/app/services/menu.service';
import { PublicService } from 'src/app/services/public.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  // public props
  layouts = BerryConfig.layout;
  currentLayout!: string;
  navCollapsed: boolean;
  navCollapsedMob = false;
  windowWidth: number;
  settingAdmin!: any
  hasAccess: boolean = false;
  adminHasWarehouse: boolean = false;
  role: string = ''
  userInfo!: any
  // Coordonnées de départ
  startY = 0;
  startX = 0;
  startScrollY = 0;
  isPulling = false;
  // États pour l'UI
  pullDistance = 0;

  // Paramètres de sensibilité
  refreshThreshold = 75; // Pixels pour déclencher le refresh
  swipeThreshold = 100;  // Pixels pour déclencher le retour


  // Constructor
  constructor(private menuService: MenuService, private authService: AuthService,
    private location: Location,
    private locationStrategy: LocationStrategy,
    public theme: CustomsThemeService, private publicService: PublicService
  ) {
    this.currentLayout = BerryConfig.layout;
    // this.berryConfig = BerryConfig;

    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }

    if (current_url === baseHref + '/layout/theme-compact' || current_url === baseHref + '/layout/box') {
      BerryConfig.isCollapse_menu = true;
    }

    this.windowWidth = window.innerWidth;
    this.navCollapsed = this.windowWidth >= 1025 ? BerryConfig.isCollapse_menu : false;
  }

  ngOnInit() {
    const allowedRoles = ['siteAdmin', 'Agent', 'Agency', 'Seller'];
    this.userInfo = this.authService?.currentUser
    this.role = this.userInfo?.role
    if (this.role === 'Admin') {
      this.adminHasWarehouse = !!this.userInfo.whStore;
    }
    this.hasAccess = allowedRoles.includes(this.role);
    this.theme.customMenuType.subscribe((layout: string) => {
      this.currentLayout = layout;
    });

    this.publicService.adminSetting$.subscribe(setting => {
      if (setting) {
        this.settingAdmin = setting
      }
    });
  }

  // public method
  navMobClick() {
    if (this.navCollapsedMob && !document.querySelector('app-navigation.coded-navbar')?.classList.contains('mob-open')) {
      this.navCollapsedMob = !this.navCollapsedMob;
      setTimeout(() => {
        this.navCollapsedMob = !this.navCollapsedMob;
      }, 100);
    } else {
      this.navCollapsedMob = !this.navCollapsedMob;
    }
  }


  onTouchStart(e: TouchEvent) {
    const x = e.touches[0].pageX;

    if (x < 25) {
      this.startX = -1;
      return;
    }

    this.startY = e.touches[0].pageY;
    this.startX = x;
    this.startScrollY = window.scrollY; // 👈 Capturer le scroll au début du geste
    this.isPulling = false;             // 👈 Reset du flag
    this.pullDistance = 0;
  }


  onTouchMove(e: TouchEvent) {
    const currentY = e.touches[0].pageY;
    const currentX = e.touches[0].pageX;

    const diffY = currentY - this.startY;
    const diffX = currentX - this.startX;

    // 👇 Le geste doit avoir COMMENCÉ à scrollY=0, pas juste y arriver
    if (this.startScrollY === 0 && diffY > 0 && Math.abs(diffX) < 30) {
      this.isPulling = true;
      this.pullDistance = Math.min(diffY / 1.8, 85);
    } else if (!this.isPulling) {
      // Si le geste ne répond pas aux critères, on ne pull pas
      this.pullDistance = 0;
    }
  }


  onTouchEnd(e: TouchEvent) {
    if (this.startX === -1) return;

    const endX = e.changedTouches[0].pageX;
    const endY = e.changedTouches[0].pageY;

    const diffX = endX - this.startX;
    const diffY = Math.abs(endY - this.startY);

    // ✅ PULL TO REFRESH — uniquement si le flag est actif
    if (this.isPulling && this.pullDistance >= this.refreshThreshold) {
      this.executeRefresh();
    }

    if (diffX > this.swipeThreshold && diffY < 60) {
      this.goBack();
    }

    this.pullDistance = 0;
    this.isPulling = false; // 👈 Reset
  }

  executeRefresh() {
    if (navigator.vibrate) navigator.vibrate(10); // Feedback haptique
    window.location.reload();
  }

  goBack() {
    if (navigator.vibrate) navigator.vibrate(15);
    this.location.back();
  }

  clickOutside(event: MouseEvent) {
    this.menuService.closeOtherMenu(event);
  }
}
