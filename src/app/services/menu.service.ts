import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { BerryConfig } from 'src/app/app-config';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private location: Location) {}

  closeOtherMenu(event: MouseEvent) {
    if (BerryConfig.layout === 'vertical') {
      const ele = event.target as HTMLElement;
      if (ele) {
        const parent = ele.parentElement;
        const up_parent = parent?.parentElement?.parentElement;
        const pre_parent = up_parent?.parentElement;
        const last_parent =
          up_parent?.parentElement?.parentElement?.parentElement?.parentElement;
        const sections = document.querySelectorAll('.coded-hasmenu');

        sections.forEach(s => {
          s.classList.remove('active', 'coded-trigger');
        });

        if (parent?.classList.contains('coded-hasmenu')) {
          parent.classList.add('coded-trigger', 'active');
        } else if (up_parent?.classList.contains('coded-hasmenu')) {
          up_parent.classList.add('coded-trigger', 'active');
        } else if (pre_parent?.classList.contains('coded-hasmenu')) {
          pre_parent.classList.add('coded-trigger', 'active');
        } else if (last_parent?.classList.contains('coded-hasmenu')) {
          last_parent.classList.add('coded-trigger', 'active');
        }
      }
    }

    const navbar = document.querySelector(
      'app-navigation.coded-navbar'
    ) as HTMLDivElement;

    if (navbar?.classList.contains('mob-open')) {
      navbar.classList.remove('mob-open');
    }
  }
}
