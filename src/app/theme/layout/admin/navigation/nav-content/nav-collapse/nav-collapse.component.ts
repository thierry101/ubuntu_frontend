// Angular import
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// project import
import { NavigationItem } from '../../navigation';
import { BerryConfig } from 'src/app/app-config';
import { CustomsThemeService } from 'src/app/theme/shared/service/customs-theme.service';

@Component({
  selector: 'app-nav-collapse',
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', display: 'block' }),
        animate('250ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(-100%)' }))])
    ])
  ]
})
export class NavCollapseComponent implements OnInit {
  // public props
  @Output() showCollapseItem: EventEmitter<object> = new EventEmitter();
  @Input() item!: NavigationItem;

  currentLayout!: string;
  windowWidth = window.innerWidth;

  // construction
  constructor(public theme: CustomsThemeService) {
    this.currentLayout = BerryConfig.layout;
  }

  // life cycle hook
  ngOnInit() {
    this.theme.customMenuType.subscribe((layout: string) => {
      this.currentLayout = layout;
    });
  }
  // public method
  navCollapse(e: MouseEvent) {
    let parent = e.target as HTMLElement;
    if (this.currentLayout === 'vertical') {
      parent = (parent as HTMLElement).parentElement as HTMLElement;
    }

    const sections = document.querySelectorAll('.coded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] !== parent) {
        sections[i].classList.remove('coded-trigger');
      }
    }

    let first_parent = parent.parentElement;
    let pre_parent = ((parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
    if (first_parent?.classList.contains('coded-hasmenu')) {
      do {
        first_parent?.classList.add('coded-trigger');
        first_parent = ((first_parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      } while (first_parent.classList.contains('coded-hasmenu'));
    } else if (pre_parent.classList.contains('coded-submenu')) {
      do {
        pre_parent?.parentElement?.classList.add('coded-trigger');
        pre_parent = (((pre_parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      } while (pre_parent.classList.contains('coded-submenu'));
    }
    parent.classList.toggle('coded-trigger');
  }

  subMenuCollapse(item: object) {
    this.showCollapseItem.emit(item);
  }
}
