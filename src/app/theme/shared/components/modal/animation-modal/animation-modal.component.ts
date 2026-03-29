// Angular import
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

// project import
import { CustomsThemeService } from '../../../service/customs-theme.service';
import { BerryConfig } from 'src/app/app-config';

@Component({
  selector: 'app-animation-modal',
  templateUrl: './animation-modal.component.html',
  styleUrls: ['./animation-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnimationModalComponent implements OnInit {
  // public props
  @Input() modalClass!: string;
  @Input() contentClass!: string;
  @Input() modalID!: string;
  @Input() backDrop = false;

  themeMode = BerryConfig.themeMode;

  constructor(public theme: CustomsThemeService) {}

  // public method
  close(event: string) {
    (document.querySelector('#' + event) as HTMLElement).classList.remove('md-show');
  }

  ngOnInit() {
    this.theme.customsLayoutType.subscribe((themeMode) => {
      this.themeMode = themeMode;
    });
  }
}
