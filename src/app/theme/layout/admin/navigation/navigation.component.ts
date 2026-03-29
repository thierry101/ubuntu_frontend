/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PublicService } from 'src/app/services/public.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  // public props
  @Output() NavCollapsedMob = new EventEmitter();
  @Output() SubmenuCollapse = new EventEmitter();
  navCollapsedMob = false;
  windowWidth = window.innerWidth;
  logo: string = '';

  // constructor
  constructor(public router: Router, private publicService: PublicService) {
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.logo = environment.siteUrlMedia + res?.logo;
      }
    });
  }

  // public method
  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }

  navSubmenuCollapse() {
    document.querySelector('app-navigation.coded-navbar')?.classList.add('coded-trigger');
  }

  returnHome() {
    this.router.navigate(['/my-profile']);
  }
}
