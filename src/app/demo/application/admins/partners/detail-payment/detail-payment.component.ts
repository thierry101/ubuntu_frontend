/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Enterprise } from 'src/app/interfaces/global';
import { PartnerService } from 'src/app/services/partner.service';
import { setPagination } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-detail-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './detail-payment.component.html',
  styleUrl: './detail-payment.component.scss'
})
export class DetailPaymentComponent implements OnInit {
  isLoading: boolean = false
  searchTerm: string = ''
  enterpriseId:number=0
  pages: number[] = [];
  enterprise!:Enterprise
  all_invoices_enterprise: any[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };

  constructor(private partnerService: PartnerService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.enterpriseId = Number(this.route.snapshot.paramMap.get('idEnterprise'));
    this.fetchInvoicesEnterprisePartner(1)
  }


  fetchInvoicesEnterprisePartner(page: number = 1) {
    this.isLoading = true;
    setPagination(
      this.partnerService.getenterpriseInvoicePartner.bind(this.partnerService) as (page: number, searchTerm: any) => Observable<any>,
      page,
      this.searchTerm,
      (data: any) => {
        this.pagination = data;
        this.all_invoices_enterprise = data?.listItems;
        this.enterprise = data.devise
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      this.enterpriseId
      // startDate and endDate are not passed — that's OK
    );
  }

}
