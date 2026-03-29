/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PrintService } from 'src/app/services/print.service';
import { PublicService } from 'src/app/services/public.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-smal-invoice',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './smal-invoice.component.html',
  styleUrl: './smal-invoice.component.scss'
})
export class SmalInvoiceComponent implements OnInit {
  @Input() order_printed!: any
  @Input() item_of_deposit!: any
  setting!: any
  // @ViewChild('tableToPrint23', { static: false }) el!: ElementRef;
  @ViewChild('tableToPrint23', { static: false }) tableToPrint!: ElementRef;
  constructor(private publicService: PublicService, private printService: PrintService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.publicService.getSettingEtpriseForCustomisation().subscribe((res: any) => {
      this.setting = res?.result
    })
  }


  // async printOrderSmall() {
  //   this.cdr.detectChanges(); // 👈 Forcer le rendu Angular avant impression

  //   // Laisser le temps au DOM de se mettre à jour
  //   await new Promise(resolve => setTimeout(resolve, 300));

  //   const printContent = document.getElementById('tableToPrint23');
  //   if (!printContent) return;

  //   const printer = this.printService.getSelectedPrinter();

  //   if (printer) {
  //     try {
  //       await this.printService.print(printContent as HTMLElement);
  //     } catch (err) {
  //       console.error('Erreur impression Bluetooth:', err);
  //       alert('Erreur lors de l\'impression. Vérifiez la connexion Bluetooth.');
  //     }
  //   } else {
  //     // Fallback navigateur sans document.write
  //     const printWindow = window.open('', '', 'height=600,width=800');
  //     if (!printWindow) return;

  //     const style = `
  //     <style>
  //       @media print {
  //         @page { size: 80mm auto; margin: 0; }
  //         body { margin: 0; padding: 10px; width: 80mm; font-family: 'Courier New', monospace; font-size: 11px; }
  //         hr { border-top: 1px dashed #000; }
  //         .text-center { text-align: center; }
  //         .text-end { text-align: right; }
  //       }
  //     </style>
  //   `;

  //     printWindow.document.head.innerHTML = `<title>Facture</title>${style}`;
  //     printWindow.document.body.innerHTML = printContent.innerHTML;

  //     printWindow.document.close();
  //     printWindow.print();
  //   }
  // }



  async printOrderSmall(): Promise<void> {
    try {
      if (!this.tableToPrint || !this.tableToPrint.nativeElement) {
        alert('❌ Vue non prête pour impression');
        return;
      }

      const element = this.tableToPrint.nativeElement as HTMLElement;

      // Important avec modal / Angular rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      const printer = this.printService.getSelectedPrinter();
      const isNative = Capacitor.isNativePlatform();

      // ✅ CAS MOBILE (Bluetooth)
      if (printer && isNative) {
        await this.printService.print(element);
        console.log('✅ Impression Bluetooth envoyée');
        return;
      }

      // 🌐 CAS NAVIGATEUR (fallback)
      const printWindow = window.open('', '', 'height=600,width=400');

      if (!printWindow) {
        alert('❌ Impossible d’ouvrir la fenêtre d’impression');
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

          hr {
            border-top: 1px dashed #000;
          }

          .text-center { text-align: center; }

          .row {
            display: flex;
            justify-content: space-between;
          }

          .col-6 {
            width: 48%;
          }
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
      }, 300);

    } catch (error: any) {
      console.error('Erreur impression:', error);
      alert('❌ Erreur: ' + (error?.message || error));
    }
  }


}