import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent implements AfterViewInit {

  @Input() message: string = '';
  @Input() placement: string = 'top';

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    const element = this.el.nativeElement.querySelector('.info-tooltip');

    if (element) {
      new bootstrap.Tooltip(element);
    }
  }
}