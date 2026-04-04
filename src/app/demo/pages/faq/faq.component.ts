/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AdminService } from 'src/app/services/admin.service';
import { setPagination } from 'src/app/share/shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  isCollapsed = true;
  isLoading: boolean = false
  searchTerm: string = ''
  panels: any[] = []
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  errors: any = []

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchFaq(1)
  }


  fetchFaq(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.adminService.getFaq.bind(this.adminService) as (page: number, searchTerm: any, startDate?: string, endDate?: string
      ) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.panels = data?.listItems;
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      }
      // startDate and endDate are not passed — that's OK
    );
  }

  onPageChange(page: number) {
    this.fetchFaq(page);
  }

}
