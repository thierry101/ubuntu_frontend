import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomsThemeService {
  customsTheme = new ReplaySubject<string>(5);
  customsLayoutType = new ReplaySubject<boolean>(2);
  customMenuType = new ReplaySubject<string>(3);
}
