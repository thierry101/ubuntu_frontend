/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SearchListComponent } from "src/app/demo/application/reusableComponents/search-list/search-list.component";
import { AuditLog } from 'src/app/interfaces/global';
import { PublicService } from 'src/app/services/public.service';
import { setPagination } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import Swal from 'sweetalert2';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [SearchListComponent, SharedModule, SetPaginationComponent, SpinnersComponent],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss'
})
export class AuditLogComponent implements OnInit {
  auditLogs: AuditLog[] = []
  loading: boolean = false;
  searchTerm: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  startDate!: string
  endDate!: string

  constructor(private publicService: PublicService) { }
  ngOnInit(): void {
    this.fetchAuditLogs(1); // reset to first page on search
  }

  onSearchChange(term: string) {
    this.searchTerm = term;
    this.fetchAuditLogs(1); // reset to first page on search
  }


  fetchAuditLogs(page: number = 1) {
    this.loading = true;
    setPagination(
      this.publicService.getAudiLogs.bind(this.publicService),
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.auditLogs = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.loading = false;
      },
      this.startDate,
      this.endDate
    );
  }



  onPageChange(page: number) {
    if (page < 1 || page > this.pagination.nber_pages) return;
    this.fetchAuditLogs(page);
  }

  validateDates() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }

    // Optionally reset to page 1 when validating
    this.fetchAuditLogs(1);
  }

  resetFilter() {
    this.startDate = ''
    this.endDate = ''
    this.searchTerm = ''
    this.fetchAuditLogs(1);
  }



  trackById(index: number, item: any): number {
    return item?.id;
  }
}
