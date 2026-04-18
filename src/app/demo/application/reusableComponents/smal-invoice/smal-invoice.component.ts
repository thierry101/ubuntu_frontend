/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PrintService, PrinterDevice } from 'src/app/services/print.service';
import { PublicService } from 'src/app/services/public.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Capacitor } from '@capacitor/core';
import { SubmitSpinnerComponent } from "../submit-spinner/submit-spinner.component";


@Component({
  selector: 'app-smal-invoice',
  standalone: true,
  imports: [SharedModule, SubmitSpinnerComponent],
  templateUrl: './smal-invoice.component.html',
  styleUrl: './smal-invoice.component.scss'
})
export class SmalInvoiceComponent implements OnInit {
  @Input() order_printed!: any;
  @Input() item_of_deposit!: any;
  setting!: any;
  isPrinting: boolean = false;
  @ViewChild('tableToPrint23', { static: false }) tableToPrint!: ElementRef;


  constructor(
    private publicService: PublicService,
    private printService: PrintService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.publicService.getSettingEtpriseForCustomisation().subscribe((res: any) => {
      this.setting = res?.result;
    });
  }

  async printOrderSmall(): Promise<void> {
    this.isPrinting = true;
    try {
      if (!this.tableToPrint || !this.tableToPrint.nativeElement) {
        this.isPrinting = false;
        return;
      }

      this.cdr.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 200));

      const element = this.tableToPrint.nativeElement as HTMLElement;
      const printer: PrinterDevice | null = this.printService.getSelectedPrinter();
      const isNative = Capacitor.isNativePlatform();

      // ✅ CAS MOBILE (Bluetooth)
      if (printer && isNative) {
        await this.printService.print(element);
        this.isPrinting = false;
        return;
      }

      // 🌐 CAS NAVIGATEUR (fallback)
      const printWindow = window.open('', '', 'height=600,width=400');
      if (!printWindow) {
        this.isPrinting = false;
        return;
      }

      const style = `
        <style>
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body {
              margin: 0;
              padding: 10px;
              width: 80mm;
              font-family: monospace;
              font-size: 11px;
            }
            hr { border-top: 1px dashed #000; }
            .text-center { text-align: center; }
            .row {
              display: flex;
              justify-content: space-between;
            }
            .col-6 { width: 48%; }
          }
        </style>
      `;

      printWindow.document.write(`
        <html>
          <head>
            <title>Facture</title>
            ${style}
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        this.isPrinting = false;
      }, 300);

    } catch (error: any) {
      this.isPrinting = false;
      console.error('Erreur impression:', error);
    }
  }
}
