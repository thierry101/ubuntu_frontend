// Angular import
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';

// third party
import { ApexAxisChartSeries, ApexChart, ChartComponent, ApexDataLabels, ApexPlotOptions, ApexResponsive, ApexStroke } from 'ng-apexcharts';
import { CustomsThemeService } from 'src/app/theme/shared/service/customs-theme.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  stroke: ApexStroke;
  colors: string[];
  fill: ApexFill;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  // public props
  @ViewChild('accountChart') accountChart!: ChartComponent;
  chartOptions: Partial<ChartOptions>;
  preset = ['#673ab7', '#2196f3', '#f44336'];

  // Constructor
  constructor(private theme: CustomsThemeService) {
    this.chartOptions = {
      chart: {
        type: 'area',
        height: 215,
        sparkline: {
          enabled: true
        }
      },
      colors: ['#673ab7', '#2196f3', '#f44336'],
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 80, 100]
        }
      },
      series: [
        {
          name: 'Youtube',
          data: [10, 90, 65, 85, 40, 80, 30]
        },
        {
          name: 'Facebook',
          data: [50, 30, 25, 15, 60, 10, 25]
        },
        {
          name: 'Twitter',
          data: [5, 50, 40, 55, 20, 40, 20]
        }
      ],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        marker: {
          show: false
        }
      }
    };
  }

  // Life cycle events
  ngOnInit(): void {
    this.theme.customsTheme.subscribe((res) => {
      if (res == 'preset-1') {
        this.preset = ['#673ab7', '#f44336', '#1e88e5'];
      }
      if (res == 'preset-2') {
        this.preset = ['#009688', '#d9534f', '#546e7a'];
      }
      if (res == 'preset-3') {
        this.preset = ['#ec407a', '#d9534f', '#1c2f59'];
      }
      if (res == 'preset-4') {
        this.preset = ['#c77e23', '#f44336', '#135152'];
      }
      if (res == 'preset-5') {
        this.preset = ['#3fb0ac', '#f44336', '#14383d'];
      }
      if (res == 'preset-6') {
        this.preset = ['#2ca58d', '#f44336', '#091f3c'];
      }
      if (res == 'preset-7') {
        this.preset = ['#3f51b5', '#f44336', '#3949ab'];
      }
    });
  }

  // private Method
  tableList = [
    {
      src: 'assets/images/widget/GERMANY.jpg',
      country: 'Germany',
      name: 'Anjalina Jolly',
      average: '56.23%'
    },
    {
      src: 'assets/images/widget/USA.jpg',
      country: 'USA',
      name: 'John Deo',
      average: '25.23%'
    },
    {
      src: 'assets/images/widget/AUSTRALIA.jpg',
      country: 'Australia',
      name: 'Jenifer Vintage',
      average: '12.45%'
    },
    {
      src: 'assets/images/widget/UK.jpg',
      country: 'United Kingdom',
      name: 'Lori Moore',
      average: '8.65%'
    },
    {
      src: 'assets/images/widget/BRAZIL.jpg',
      country: 'Brazil',
      name: 'Allina D’croze',
      average: '3.56%'
    },
    {
      src: 'assets/images/widget/AUSTRALIA.jpg',
      country: 'Australia',
      name: 'Jenifer Vintage',
      average: '12.45%'
    },
    {
      src: 'assets/images/widget/USA.jpg',
      country: 'USA',
      name: 'John Deo',
      average: '25.23%'
    },
    {
      src: 'assets/images/widget/UK.jpg',
      country: 'United Kingdom',
      name: 'Lori Moore',
      average: '8.65%'
    }
  ];
  revenueList = [
    {
      color: 'text-success',
      name: 'Bitcoin',
      percentage: '+ $145.85'
    },
    {
      color: 'text-danger',
      name: 'Ethereum',
      percentage: '- $6.368'
    },
    {
      color: 'text-success',
      name: 'Ripple',
      percentage: '+ $458.63'
    },
    {
      color: 'text-danger',
      name: 'Neo',
      percentage: '- $5.631'
    },
    {
      color: 'text-danger',
      name: 'Bitcoin',
      percentage: '- $75.86'
    },
    {
      color: 'text-success',
      name: 'Ethereum',
      percentage: '+ $453.63'
    },
    {
      color: 'text-danger',
      name: 'Ripple',
      percentage: '+ $786.63'
    },
    {
      color: 'text-success',
      name: 'Neo',
      percentage: '+ $145.85'
    },
    {
      color: 'text-success',
      name: 'Bitcoin',
      percentage: '- $6.368'
    },
    {
      color: 'text-success',
      name: 'Ethereum',
      percentage: '+ $458.63'
    },
    {
      color: 'text-danger',
      name: 'Neo',
      percentage: '- $5.631'
    },
    {
      color: 'text-danger',
      name: 'Ripple',
      percentage: '+ $145.85'
    },
    {
      color: 'text-success',
      name: 'Bitcoin',
      percentage: '- $75.86'
    },
    {
      color: 'text-success',
      name: 'Bitcoin',
      percentage: '+ $453.63'
    },
    {
      color: 'text-danger',
      name: 'Ethereum',
      percentage: '+ $786.63'
    }
  ];
  rowTable = [
    {
      icon: 'filter_vintage',
      value: '3550',
      ship: 'Returns'
    },
    {
      icon: 'local_mall',
      value: '100%',
      ship: 'Order'
    }
  ];
  rowTable1 = [
    {
      icon: 'share',
      value: '1000',
      ship: 'Shares'
    },
    {
      icon: 'router',
      value: '600',
      ship: 'Network'
    }
  ];
  cards = [
    {
      title: 'Revenue',
      amount: '$42,562',
      text: '$50,032 Last Month',
      icon: 'monetization_on',
      color: 'bg-secondary'
    },
    {
      title: 'Orders Received',
      amount: '486',
      text: '20% Increase',
      icon: 'account_circle',
      color: 'bg-primary'
    }
  ];
  dailyCard = [
    {
      title: 'Daily user',
      amount: '1,658',
      icon: 'account_circle',
      color: 'bg-secondary'
    },
    {
      title: 'Daily visitor',
      amount: '5,678',
      icon: 'description',
      color: 'bg-primary'
    }
  ];

  data = [
    {
      background: 'bg-light-secondary',
      icons: 'ti ti-brand-facebook text-secondary',
      value: '+ 45.36%'
    },
    {
      background: 'bg-light-primary',
      icons: 'ti ti-brand-twitter text-primary',
      value: '- 50.69%'
    },
    {
      background: 'bg-light-danger',
      icons: 'ti ti-brand-youtube text-danger',
      value: '+ 16.85%'
    }
  ];
}
