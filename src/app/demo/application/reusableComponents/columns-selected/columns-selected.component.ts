/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-columns-selected',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './columns-selected.component.html',
  styleUrl: './columns-selected.component.scss'
})
export class ColumnsSelectedComponent {
  @Input() columns: { key: string, label: string, visible: boolean }[] = [];
  @Output() toggle = new EventEmitter<string>();

  trackById(index: number, col: any): number {
    return col.id; // or any unique field
  }
}
