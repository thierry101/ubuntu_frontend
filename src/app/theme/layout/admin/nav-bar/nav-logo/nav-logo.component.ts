/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// project import
import { BerryConfig } from 'src/app/app-config';
import { PublicService } from 'src/app/services/public.service';
import { CustomsThemeService } from 'src/app/theme/shared/service/customs-theme.service';

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent implements OnInit {
  // public props
  @Input() navCollapsed!: boolean;
  @Output() NavCollapse = new EventEmitter();
  windowWidth: number;
  themeMode!: boolean;
  logo: string = '';

  // Constructor
  constructor(
    public router: Router,
    private theme: CustomsThemeService, private publicService: PublicService
  ) {
    this.windowWidth = window.innerWidth;
  }

  // life cycle event
  ngOnInit() {
    this.themeMode = BerryConfig.themeMode;
    this.theme.customsLayoutType.subscribe((res) => {
      this.themeMode = res;
    });

    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.logo = res?.logo;
      }
    });
  }

  // public import
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  returnToHome() {
    this.router.navigate(['/my-profile']);
  }
}
