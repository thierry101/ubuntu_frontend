import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinners',
  standalone: true,
  imports: [],
  templateUrl: './spinners.component.html',
  styleUrl: './spinners.component.scss'
})
export class SpinnersComponent {
  @Input() message: string = 'Chargement...';

}
