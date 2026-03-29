import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-search-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.scss'
})
export class SearchListComponent {

  @Input() searchTerm: string = '';
  @Output() searchChange = new EventEmitter<string>();

  searchItem() {
    const trimmed = this.searchTerm.trim();
    this.searchChange.emit(trimmed);
    // if (trimmed?.length > 1 || trimmed?.length === 1) {
    //   this.searchChange.emit(trimmed);
    // }
  }

}
