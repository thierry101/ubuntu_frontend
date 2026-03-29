import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-set-pagination',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './set-pagination.component.html',
  styleUrl: './set-pagination.component.scss'
})
export class SetPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() previousPage: string | null = null;
  @Input() nextPage: string | null = null;

  @Output() pageChange = new EventEmitter<number>();

  // Show 5 pages at a time
  get pages(): number[] {
    const maxVisiblePages = 5;

    // When currentPage is exactly divisible by maxVisiblePages, shift to the next block
    const adjustedPage = this.currentPage % maxVisiblePages === 0
      ? this.currentPage + 1
      : this.currentPage;

    const startPage = Math.floor((adjustedPage - 1) / maxVisiblePages) * maxVisiblePages + 1;
    const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }


  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
