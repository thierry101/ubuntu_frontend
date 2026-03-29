/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Angular Import
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

// third party
import ApexCharts from 'apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexAnnotations,
  ApexXAxis,
  ApexGrid,
  ApexStroke,
  ApexTheme
} from 'ng-apexcharts';
import { DashboardService } from 'src/app/services/dashboard.service';
import { PublicService } from 'src/app/services/public.service';
import { Subject } from 'rxjs';
import { Warehouse } from 'src/app/interfaces/global';
import Swal from 'sweetalert2';
import { AccountProfileRoutingModule } from "../../application/user/account-profile/account-profile-routing.module";
import { SpinnersComponent } from '../../application/reusableComponents/spinners/spinners.component';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  colors: string[];
  grid: ApexGrid;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  theme: ApexTheme;
  fill: ApexFill;
  yaxis: ApexYAxis;
  annotations: ApexAnnotations;
  title: ApexTitleSubtitle;
  labels: any;
  legend: ApexLegend;

};


@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule, AccountProfileRoutingModule, SpinnersComponent],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  // private props
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions: Partial<ChartOptions>;
  chartOptions5: Partial<ChartOptions>;

  sale_today: number = 0
  sale_month: number = 0
  credit_note_today: number = 0
  credit_note_month: number = 0
  tva_today: number = 0
  expensive_month: number = 0
  devise: string = '';
  tableCurrentSale: any[] = []
  topProductsSale: any[] = []
  revenueWH: any[] = []
  topBestClients: any[] = []
  highestOrdersToday!: any
  highestBestClient!: any
  warehouses: Warehouse[] = []
  idWhstore: number = 0
  startDate: string = ''
  endDate: string = ''
  startDateClient: string = ''
  endDateClient: string = ''
  startDateWhStor: string = ''
  endDateWhStor: string = ''
  isLoadingSell: boolean = false;
  isLoadingWhStor: boolean = false;
  isLoadingProduct: boolean = false;
  isLoadingClient: boolean = false;

  private destroy$ = new Subject<void>();

  getColor(value: number, minimum: number, maximum: number): string {
    if (typeof value !== 'number' || isNaN(value)) return 'rgb(200, 200, 200)';
    if (typeof minimum !== 'number' || typeof maximum !== 'number') return 'rgb(200, 200, 200)';

    // Avoid division by zero
    if (maximum === minimum) return 'rgb(100, 100, 100)';

    const percent = (value - minimum) / (maximum - minimum);
    const r = Math.round(255 * percent);
    const g = Math.round(255 * (1 - percent));

    // Clamp values to 0–255
    const safeR = Math.min(Math.max(r, 0), 255);
    const safeG = Math.min(Math.max(g, 0), 255);

    return `rgb(${safeR}, ${safeG}, 80)`;
  }


  // Constructor
  constructor(private dashboardService: DashboardService, private publicService: PublicService) {
    this.chartOptions5 = {};
    this.chartOptions = {};
    // Filterrevenue for warehouse and store
    this.isLoadingSell = true
    this.isLoadingProduct = true
    this.dashboardService.getRevenueWh().subscribe({
      next: (res: { results: any }) => {
        // this.revenueWH = res?.results || []
        this.revenueWH = (res?.results || []).filter(
          (item: any) => item?.nameWh && typeof item?.net_revenue === 'number'
        );
        const categoriesData = this.revenueWH.map((item: any) => item?.nameWh);
        const contentData = this.revenueWH.map((item: any) => item?.net_revenue).filter((val: any) => typeof val === 'number' && !isNaN(val));

        // const contentData = this.revenueWH.map((item: any) => item?.net_revenue);
        const dynamicColors = contentData.map(val => this.getColor(val, Math.min(...contentData), Math.max(...contentData)));
        this.chartOptions = {
          series: [
            {
              data: contentData
            }
          ],
          chart: {
            height: 350,
            type: "bar",
            events: {
              click: function (chart, w, e) {
                // console.log(chart, w, e)
              }
            }
          },
          colors: dynamicColors,
          plotOptions: {
            bar: {
              columnWidth: "45%",
              distributed: true
            }
          },
          dataLabels: {
            enabled: false
          },
          legend: {
            show: false
          },
          grid: {
            show: false
          },
          xaxis: {
            categories: categoriesData,
            labels: {
              style: {
                colors: dynamicColors,
                fontSize: "12px"
              }
            }
          }
        };
        this.isLoadingSell = false
      }
    })

    this.dashboardService.getTopSoldProduts().subscribe({
      next: (res: { results: any }) => {
        // this.topProductsSale = res?.results || []
        this.topProductsSale = (res?.results || []).filter(
          (item: any) => item?.name && typeof item?.quantity_sold === 'number'
        );
        const seriesData = this.topProductsSale.map((item: any) => item?.quantity_sold);
        const labelsData = this.topProductsSale.map((item: any) => item?.name);
        this.chartOptions5 = {
          series: seriesData,
          chart: {
            width: 500,
            type: "pie"
          },
          labels: labelsData.map((label: string) =>
            label.length > 30 ? label.slice(0, 30) + '…' : label
          ),
          tooltip: {
            y: {
              formatter: (val: number) => `${val} produits vendus`
            }
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 300
                },
                legend: {
                  position: "bottom"
                }
              }
            }
          ]
        };
        this.isLoadingProduct = false
      }
    })
  }

  // Life cycle events
  ngOnInit(): void {
    const today = new Date();

    // Premier jour du mois
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // Dernier jour du mois
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDateClient = this.formatDate(firstDay);
    this.endDateClient = this.formatDate(lastDay);
    this.filterBestClients()
    this.isLoadingWhStor = true
    this.dashboardService.getStatDashboard().subscribe({
      next: (res: { total_sales_today: number, total_amount_total: number, total_tva_today: number, expensive_month: number, total_credit_today: number, total_credit_month: number }) => {
        this.expensive_month = res?.expensive_month
        this.sale_today = res?.total_sales_today
        this.sale_month = res?.total_amount_total
        this.tva_today = res?.total_tva_today
        this.credit_note_today = res?.total_credit_today
        this.credit_note_month = res?.total_credit_month
      }
    })

    if (this.topBestClients.length > 0) {
      this.highestBestClient = this.topBestClients.reduce(
        (prev: any, current: any) =>
          current.total_achats > prev.total_achats ? current : prev
      );
    } else {
      this.highestBestClient = null;
    }


    this.dashboardService.getSaleWhStore().subscribe({
      next: (res: { results: any }) => {
        this.tableCurrentSale = res?.results || []
        this.isLoadingWhStor = false
        this.highestOrdersToday = this.tableCurrentSale?.reduce((prev: any, current: any) => {
          return current?.total_orders_today > prev?.total_orders_today ? current : prev;
        });
      }
    })

    this.publicService.getWarehouseStore().subscribe({
      next: (res: { result: Warehouse[] }) => {
        this.warehouses = res?.result;
      }
    });

    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });

  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  filterBestClients() {
    this.isLoadingClient = true
    if (this.startDateClient && this.endDateClient && this.startDateClient > this.endDateClient) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    } else {
      this.dashboardService.getTopBestClients(this.startDateClient, this.endDateClient).subscribe({
        next: (res: { results: any }) => {
          this.topBestClients = res?.results || []
          this.isLoadingClient = false
          this.highestBestClient = this.topBestClients.sort((a, b) => b.total_achats - a.total_achats)[0] ?? null;
          // this.highestBestClient = this.topBestClients.reduce((prev: any, current: any) => {
          //   return current.total_achats > prev.total_achats ? current : prev;
          // });

        }
      })
    }
  }


  filterTopProducts() {
    this.isLoadingProduct = true
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    } else {
      this.dashboardService.getTopSoldProduts(this.idWhstore, this.startDate, this.endDate).subscribe({
        next: (res: { results: any }) => {
          this.topProductsSale = res?.results || []
          const seriesData = this.topProductsSale.map((item: any) => item?.quantity_sold);
          const labelsData = this.topProductsSale.map((item: any) => item?.name);
          this.chartOptions5 = {
            series: seriesData,
            chart: {
              width: 500,
              type: "pie"
            },
            labels: labelsData.map((label: string) =>
              label.length > 30 ? label.slice(0, 30) + '…' : label
            ),
            tooltip: {
              y: {
                formatter: (val: number) => `${val} produits vendus`
              }
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 300
                  },
                  legend: {
                    position: "bottom"
                  }
                }
              }
            ]
          };
          this.isLoadingProduct = false
        }
      })
    }
    // this.fetchOrdersDeposit(1);
  }


  filterRevenueWhStore() {
    this.isLoadingSell = true
    this.dashboardService.getRevenueWh(this.startDateWhStor, this.endDateWhStor).subscribe({
      next: (res: { results: any }) => {
        this.revenueWH = res?.results || []
        const categoriesData = this.revenueWH.map((item: any) => item?.nameWh);
        const contentData = this.revenueWH.map((item: any) => item?.net_revenue);
        const dynamicColors = contentData.map(val => this.getColor(val, Math.min(...contentData), Math.max(...contentData)));
        this.isLoadingSell = false
        this.chartOptions = {
          series: [
            {
              name: "distibuted",
              data: contentData
            }
          ],
          chart: {
            height: 350,
            type: "bar",
            events: {
              click: function (chart, w, e) {
              }
            }
          },
          colors: dynamicColors,
          plotOptions: {
            bar: {
              columnWidth: "45%",
              distributed: true
            }
          },
          dataLabels: {
            enabled: false
          },
          legend: {
            show: false
          },
          grid: {
            show: false
          },
          xaxis: {
            categories: categoriesData,
            labels: {
              style: {
                colors: dynamicColors,
                fontSize: "12px"
              }
            }
          }
        };
      }
    })
  }

}
