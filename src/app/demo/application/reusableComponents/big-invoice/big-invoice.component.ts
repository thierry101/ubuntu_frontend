/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { PublicService } from 'src/app/services/public.service';
import { isMobileApp, typesPayment } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImagePipe } from "../../../../pipes/image.pipe";
import { SubmitSpinnerComponent } from "../submit-spinner/submit-spinner.component";

@Component({
  selector: 'app-big-invoice',
  standalone: true,
  imports: [SharedModule, ImagePipe, SubmitSpinnerComponent],
  templateUrl: './big-invoice.component.html',
  styleUrl: './big-invoice.component.scss'
})
export class BigInvoiceComponent implements OnInit {
  @Input() order_printed!: any
  @Input() item_of_deposit!: any
  setting!: any
  typePayments!: any
  isPrinting: boolean = false;
  isMobileApp: boolean = false;



  constructor(private publicService: PublicService) { }

  ngOnInit(): void {
    this.isMobileApp = isMobileApp;
    this.typePayments = typesPayment
    this.publicService.getSettingEtpriseForCustomisation().subscribe((res: any) => {
      this.setting = res?.result
    })
  }

  getPaymentName(value: string): string {
    const method = this.typePayments.find((m: any) => m.value === value);
    return method ? method.name : value;
  }

  printInvoice(): void {
    this.isPrinting = true;
    const printContents = document.getElementById('contentPrint001')?.innerHTML;

    if (!printContents) {
      this.isPrinting = false;
      return;
    }

    const popupWindow = window.open('', '_blank', 'width=900,height=650');

    if (popupWindow) {

      // GET ALL STYLESHEETS FROM CURRENT PAGE
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((node) => node.outerHTML)
        .join('\n');

      popupWindow.document.open();

      popupWindow.document.write(`
      <html>
        <head>
          <title>Facture</title>
          ${stylesheets}

          <style>
            @page {
              size: A4;
              margin: 10mm;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .modal,
            .modal-dialog,
            .modal-content,
            .no-print {
              display: none !important;
            }

            /* Ensure invoice wrapper fits A4 */
            .invoice-wrapper {
              width: 100% !important;
              max-width: 21cm !important;
              margin: auto !important;
              font-size: 11pt !important;
              padding: 0 !important;
            }

            .modal-body {
              overflow: visible !important;
              max-height: none !important;
            }
          </style>
        </head>

        <body>
          <div class="invoice-wrapper">
            ${printContents}
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 300);
            };
          </script>
        </body>
      </html>
    `);

      this.isPrinting = false;
      popupWindow.document.close();
    }
  }



}
