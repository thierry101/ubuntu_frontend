import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-my-theme',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './my-theme.component.html',
  styleUrl: './my-theme.component.scss'
})
export class MyThemeComponent {

}
