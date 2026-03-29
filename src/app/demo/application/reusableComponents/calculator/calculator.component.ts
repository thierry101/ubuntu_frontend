import { Component } from '@angular/core';
import { CalculatorService } from 'src/app/services/calculator.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

interface CalcButton {
  label: string;
  key: string;
  type: 'digit' | 'operator' | 'action' | 'equals';
  span?: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent {

  constructor(public calc: CalculatorService) { }



  readonly buttons: CalcButton[][] = [
    [
      { label: 'C', key: 'C', type: 'action' },
      { label: '±', key: '±', type: 'action' },
      { label: '%', key: '%', type: 'action' },
      { label: '÷', key: '/', type: 'operator' },
    ],
    [
      { label: '7', key: '7', type: 'digit' },
      { label: '8', key: '8', type: 'digit' },
      { label: '9', key: '9', type: 'digit' },
      { label: '×', key: '*', type: 'operator' },
    ],
    [
      { label: '4', key: '4', type: 'digit' },
      { label: '5', key: '5', type: 'digit' },
      { label: '6', key: '6', type: 'digit' },
      { label: '−', key: '-', type: 'operator' },
    ],
    [
      { label: '1', key: '1', type: 'digit' },
      { label: '2', key: '2', type: 'digit' },
      { label: '3', key: '3', type: 'digit' },
      { label: '+', key: '+', type: 'operator' },
    ],
    [
      { label: '0', key: '0', type: 'digit', span: 2 },
      { label: '.', key: '.', type: 'digit' },
      { label: '=', key: '=', type: 'equals' },
    ],
  ];

  press(key: string): void {
    this.calc.press(key);
  }

}
