/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';

// project import
import { NavigationItem } from '../../navigation';
import { BerryConfig } from 'src/app/app-config';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-group',
  templateUrl: './nav-group.component.html',
  styleUrls: ['./nav-group.component.scss']
})
export class NavGroupComponent implements OnInit {
  // public props
  role: string = ''
  permissions!: any
  hasPermission = false;
  @Input() item!: NavigationItem;
  @Output() showCollapseItem: EventEmitter<string> = new EventEmitter();

  // Constructor
  constructor(private location: Location, private authService: AuthService) { }

  // Life cycle events
  ngOnInit() {
    // at reload time active and trigger link
    let current_url = this.location.path();
    this.role = this.authService.currentUser?.role
    this.permissions = this.authService.currentPermissions || [];
    this.hasPermission = this.item.all_permissions?.some((p: any) => this.permissions?.includes(p));

    // eslint-disable-next-line
    // @ts-ignore
    if (this.location['_baseHref']) {
      // eslint-disable-next-line
      // @ts-ignore
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const pre_parent = up_parent?.parentElement;
      const last_parent = up_parent?.parentElement?.parentElement?.parentElement?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        if (BerryConfig.layout === 'vertical') {
          parent.classList.add('coded-trigger');
        }
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        if (BerryConfig.layout === 'vertical') {
          up_parent.classList.add('coded-trigger');
        }
        up_parent.classList.add('active');
      } else if (pre_parent?.classList.contains('coded-hasmenu')) {
        if (BerryConfig.layout === 'vertical') {
          pre_parent.classList.add('coded-trigger');
        }
        pre_parent.classList.add('active');
      }

      if (last_parent?.classList.contains('coded-hasmenu')) {
        if (BerryConfig.layout === 'vertical') {
          last_parent.classList.add('coded-trigger');

          if (pre_parent?.classList.contains('coded-hasmenu')) {
            pre_parent.classList.add('coded-trigger');
          }
        }
        last_parent.classList.add('active');
      }
    }
  }

  // public method
  subMenuCollapse(item: string) {
    this.showCollapseItem.emit(item);
  }
}
