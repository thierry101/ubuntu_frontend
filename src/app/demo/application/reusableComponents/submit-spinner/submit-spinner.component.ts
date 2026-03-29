import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-submit-spinner',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './submit-spinner.component.html',
  styleUrl: './submit-spinner.component.scss'
})
export class SubmitSpinnerComponent {

  @Input() loading: boolean = false;
  @Input() label: string = 'Valider';
  @Input() cssClass: string = 'btn btn-outline-secondary btn-sm';
  @Input() icon: string | null = "ti ti-refresh me-1"; // ← NEW: optional icon

  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    if (!this.loading) {
      this.clicked.emit();
    }
  }

}
