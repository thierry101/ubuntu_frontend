/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../services/store.service';
import { Orders } from '../interfaces/global';
import { SharedModule } from '../theme/shared/shared.module';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from 'src/environments/environment.prod';
import { showError } from '../share/shared';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  name_invoice: string = ""
  invoice!: Orders
  url: string = environment.siteUrlMedia
  errors: any = []

  constructor(private route: ActivatedRoute, private storeService: StoreService) { }

  ngOnInit(): void {
    this.name_invoice = this.route.snapshot.paramMap.get('name_invoice')!;
    this.storeService.getUniqueInvoice(this.name_invoice).subscribe({
      next: (data) => {
        this.invoice = data?.result;
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        // this.loadSpinnerPromo = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    });
  }


  downloadInvoice() {
    const element = document.querySelector('.inv-wrap') as HTMLElement;

    if (!element) {
      console.error('Élément .inv-wrap introuvable');
      return;
    }

    html2canvas(element, {
      useCORS: true,
      scale: 2,        // meilleure qualité
      logging: false
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${this.invoice?.nberInvoice ?? 'facture'}.pdf`);
    });
  }

}

