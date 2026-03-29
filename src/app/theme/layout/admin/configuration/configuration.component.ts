// Angular import
import { Component, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { BerryConfig } from 'src/app/app-config';
import { Location, LocationStrategy } from '@angular/common';
import { CustomsThemeService } from 'src/app/theme/shared/service/customs-theme.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigurationComponent implements OnInit {
  // public method
  styleSelectorToggle!: boolean; // open configuration menu
  berryConfig!: BerryConfig; // theme Config
  windowWidth: number; // screen width
  layout!: string; // sidebar navigation
  themeMode!: boolean; // layoutMode type
  rtlLayout!: boolean; // rtl type
  boxContainer!: boolean; // box container flag
  setFontFamily!: string; // fontFamily
  bodyColor!: string; // berry Customizes
  sidebar_caption_hide!: boolean; // sidebar menu caption
  resetLayoutType!: string; // default layout
  active = 1;

  // Constructor
  constructor(
    private location: Location,
    private renderer: Renderer2,
    private locationStrategy: LocationStrategy,
    private theme: CustomsThemeService
  ) {
    this.setThemeLayout();
    this.windowWidth = window.innerWidth;
  }

  // Life cycle events
  ngOnInit() {
    this.layout = BerryConfig.layout;
    this.setMenuOrientation(this.layout);
    this.styleSelectorToggle = false;
    this.themeMode = BerryConfig.themeMode;
    this.setDarkLayout(this.themeMode);
    this.setFontFamily = BerryConfig.font_family;
    this.fontFamily(this.setFontFamily);
    this.bodyColor = BerryConfig.theme_color;
    this.SetBodyColor(this.bodyColor);
    this.rtlLayout = BerryConfig.isRtl_layout;
    this.setRtlLayout(this.rtlLayout);
    this.boxContainer = this.windowWidth >= 1025 ? BerryConfig.isBox_container : false;
    this.setBoxContainer(this.boxContainer);
    this.sidebar_caption_hide = BerryConfig.sidebar_caption_hide;
    this.captionShow(this.sidebar_caption_hide);
  }

  // public method

  // sidebar layout change
  setThemeLayout() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }

    switch (current_url) {
      case baseHref + '/layout/vertical':
        BerryConfig.layout = 'vertical';
        break;

      case baseHref + '/layout/compact':
        BerryConfig.layout = 'compact';
        break;

      case baseHref + '/layout/horizontal':
        BerryConfig.layout = 'horizontal';
        break;
    }
  }

  // change main layout dark and light
  setDarkLayout(isDark: boolean) {
    if (isDark) {
      document.querySelector('.coded-navbar')?.classList.add('navbar-dark');
      document.querySelector('.pc-header')?.classList.add('header-dark');
      this.renderer.addClass(document.body, 'berry-dark');
      document.querySelector('html')?.classList.add('dark');
      this.themeMode = true;
    } else {
      document.querySelector('.coded-navbar')?.classList.remove('light');
      document.querySelector('.coded-navbar')?.classList.remove('navbar-dark');
      document.querySelector('.pc-header')?.classList.remove('header-dark');
      this.renderer.removeClass(document.body, 'berry-dark');
      document.querySelector('html')?.classList.remove('dark');
      this.SetBodyColor('preset-1');
      this.fontFamily('Roboto');
      this.themeMode = false;
    }
    this.theme.customsLayoutType.next(this.themeMode);
  }

  // default mode
  setResetLayout(layout: string) {
    if (layout === 'reset') {
      this.ngOnInit();
    }
  }

  // ser rtl and ltr theme mode
  setRtlLayout(layout: boolean) {
    if (layout) {
      this.renderer.addClass(document.body, 'berry-rtl');
      this.rtlLayout = true;
    } else {
      this.renderer.removeClass(document.body, 'berry-rtl');
      this.rtlLayout = false;
    }
  }

  // sidebar menu caption show and hide
  captionShow(hide: boolean) {
    if (hide) {
      document.querySelector('.coded-navbar')?.classList.add('caption-hide');
      this.sidebar_caption_hide = true;
    } else {
      document.querySelector('.coded-navbar')?.classList.remove('caption-hide');
      this.sidebar_caption_hide = false;
    }
  }

  // set box container
  setBoxContainer(boxContainer: boolean) {
    if (boxContainer) {
      document.querySelector('.coded-content')?.classList.add('container');
      this.boxContainer = true;
    } else {
      document.querySelector('.coded-content')?.classList.remove('container');
      this.boxContainer = false;
    }
  }

  // set font family
  fontFamily(font: string) {
    this.setFontFamily = font;
    this.renderer.removeClass(document.body, 'Roboto');
    this.renderer.removeClass(document.body, 'Poppins');
    this.renderer.removeClass(document.body, 'Inter');
    this.renderer.addClass(document.body, font);
  }

  // set theme different color
  SetBodyColor(background: string) {
    this.bodyColor = background;
    document.querySelector('body')?.part.remove('preset-1');
    document.querySelector('body')?.part.remove('preset-2');
    document.querySelector('body')?.part.remove('preset-3');
    document.querySelector('body')?.part.remove('preset-4');
    document.querySelector('body')?.part.remove('preset-5');
    document.querySelector('body')?.part.remove('preset-6');
    document.querySelector('body')?.part.remove('preset-7');
    document.querySelector('body')?.part.add(background);
    this.theme.customsTheme.next(background);
  }

  setMenuOrientation(layout: string) {
    this.layout = layout;
    document.querySelector('.coded-navbar')?.classList.remove('compact');
    document.querySelector('.coded-navbar')?.classList.remove('horizontal');
    document.querySelector('.coded-navbar')?.classList.remove('vertical');
    document.querySelector('.coded-navbar')?.classList.add(layout);
    this.theme.customMenuType.next(layout);
  }
}
