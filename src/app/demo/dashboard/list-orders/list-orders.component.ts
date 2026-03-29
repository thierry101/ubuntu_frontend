/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Enterprise, Warehouse } from 'src/app/interfaces/global';
import { DashboardService } from 'src/app/services/dashboard.service';
import { PublicService } from 'src/app/services/public.service';
import { getDateString, setPagination } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ColumnsSelectedComponent } from "../../application/reusableComponents/columns-selected/columns-selected.component";
import { ColumnsVisibilityService } from 'src/app/services/columns-visibility.service';
import { exportAllOrFilterToPDF, exportToExcelAllItem } from 'src/app/share/export_fil';
import { firstValueFrom, map } from 'rxjs';
import { DatePipe } from '@angular/common';
import { SpinnersComponent } from '../../application/reusableComponents/spinners/spinners.component';
import { SetPaginationComponent } from "../../application/reusableComponents/set-pagination/set-pagination.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-orders',
  standalone: true,
  imports: [SharedModule, ColumnsSelectedComponent, DatePipe, SpinnersComponent, SetPaginationComponent],
  providers: [DatePipe],
  templateUrl: './list-orders.component.html',
  styleUrl: './list-orders.component.scss'
})
export class ListOrdersComponent implements OnInit {
  the_date: string = ""
  id_wh_store!: any
  isLoading: boolean = false
  startDate: string = ''
  endDate: string = ''
  devise: string = ""
  pages: number[] = [];
  all_orders: any[] = []
  warehouses: Warehouse[] = []
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  settingEnterprise!: Enterprise
  columns = [
    { key: 'nberInvoice', label: 'Numéro Facture', visible: true },
    { key: 'client_name', label: 'Nom client', visible: true },
    { key: 'product', label: 'Article', visible: true },
    { key: 'qty', label: 'Quantité', visible: true },
    { key: 'unitPrice', label: 'Prix unitaire', visible: true },
    { key: 'total', label: 'Total', visible: true },
    { key: 'tva', label: 'TVA', visible: true },
    { key: 'date_create', label: 'Date facture', visible: true },
  ];

  constructor(private route: ActivatedRoute, private dashboardService: DashboardService, private publicService: PublicService,
    private columnVisibility: ColumnsVisibilityService, private datePipe: DatePipe, private router: Router
  ) { }

  ngOnInit(): void {
    this.publicService.getWarehouseStore().subscribe({
      next: (res: { result: Warehouse[] }) => {
        this.warehouses = res?.result;
      }
    });
    this.the_date = getDateString()
    this.columnVisibility.setColumns(this.columns); //call the service
    this.publicService.getSettingEtpriseForCustomisation().subscribe({
      next: (res: { result: Enterprise, typePayments: any }) => {
        this.settingEnterprise = res?.result
        this.devise = res?.result?.devise
      }
    })
    this.id_wh_store = this.route.snapshot.paramMap.get('id_wh_store')!;
    this.fetchProductsOrders(1)
  }


  fetchProductsOrders(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.dashboardService.getOrdersWhStore.bind(this.dashboardService), page, this.id_wh_store, (data: any) => {
      this.pagination = data;
      this.all_orders = data?.listItems;
      this.isLoading = false
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    }, this.startDate,
      this.endDate,
    )
  }

  onPageChange(page: number) {
    this.fetchProductsOrders(page);
  }

  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchProductsOrders(1);
  }

  filterByWarehouse(){
    this.router.navigate(['/list-orders-warehouse', this.id_wh_store])
    this.fetchProductsOrders(1)
  }


  // ******************************* About to show or hide column *******************************
  toggleColumnVisibility(columnKey: string) {
    this.columnVisibility.toggleColumn(columnKey, this.columns);
  }

  exportAllItemToExcel(): void {
    exportToExcelAllItem({
      fetchDataFn: () =>
        firstValueFrom(
          this.dashboardService.getOrdersWhStore(1, this.id_wh_store, this.startDate, this.endDate, false).pipe(
            map((res: { results: any[] }) => res.results)
          )
        ),
      searchTermStock: '',
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      fileName: 'export_expense'
    });
  }

  exportAllToPDF(): void {
    exportAllOrFilterToPDF({
      fetchDataFn: () =>
        this.dashboardService.getOrdersWhStore(1, this.id_wh_store, this.startDate, this.endDate, false).pipe(
          map((res: { results: any[] }) => res.results)
        ),
      searchTerm: '',
      columns: this.columns,
      getExportRows: this.getExportRows.bind(this),
      theDate: this.the_date,
      title: "Export des dépenses",
      nameFile: "export_expense"
    });
  }

  // --- Export helpers ---
  // --- Export helpers ---
  getExportRows(data: any[], columns: any[]) {
    const rows: any[] = [];

    data.forEach(order => {
      const listOrders = order?.listItems || [];

      // If the order has listItems, create a row per item
      if (listOrders.length > 0) {
        listOrders.forEach((item: any) => {
          const row = columns.map(col => {
            switch (col.key) {
              case 'date_create': return this.datePipe.transform(order?.created_at, "dd/MM/yyyy 'à' HH:mm", '', 'fr') || '—';
              case 'nberInvoice': return order?.nberInvoice || '';
              case 'client_name': return order?.client?.name || '';
              case 'product': return item?.product?.product || '';
              case 'qty': return item?.quantity || 0;
              case 'unitPrice': return Math.round(item?.sold_price) || 0;
              case 'total': return Math.round(item?.total_price) || 0;
              case 'tva': return Math.round(item?.amount_tva) || 0;
              default: return '';
            }
          });
          rows.push(row);
        });
      } else {
        // If no listItems, still export the order as a single empty row
        const row = columns.map(col => {
          switch (col.key) {
            case 'nberInvoice': return order?.nberInvoice || '';
            case 'client_name': return order?.client?.name || '';
            case 'product': return '';
            case 'qty': return '';
            case 'unitPrice': return '';
            case 'total': return '';
            case 'tva': return Math.round(order?.totalTva) || '';
            default: return '';
          }
        });
        rows.push(row);
      }
    });

    return rows;
  }

}
