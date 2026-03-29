/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SaveExpensive, Warehouse } from 'src/app/interfaces/global';
import { ExpensiveService } from 'src/app/services/expensive.service';
import { PublicService } from 'src/app/services/public.service';
import { showError } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { environment } from 'src/environments/environment.prod';
// import html2pdf from 'html2pdf.js';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-calculate-profits',
  standalone: true,
  imports: [SharedModule, SpinnersComponent],
  templateUrl: './calculate-profits.component.html',
  styleUrl: './calculate-profits.component.scss'
})
export class CalculateProfitsComponent implements OnInit {

  idWhStoreSelected: number = 0
  monthProfit: string = ''
  warehouses: Warehouse[] = []
  allExpensives: SaveExpensive[] = []
  totalSell: number = 0
  totalExpense: number = 0
  profit: number = 0
  errors: any = []
  devise: string = ''
  isLoading: boolean = false
  totalBuy: number = 0
  urlMedia: string = ""


  constructor(private publicService: PublicService, private expensiveService: ExpensiveService) { }

  ngOnInit(): void {
    this.urlMedia = environment.siteUrlMedia
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });
    this.publicService.getWarehousesStores().subscribe({
      next: (res: { result: Warehouse[] }) => {
        this.warehouses = res?.result;
      }
    });
  }

  calculateProfit() {
    this.isLoading = true
    const btnClose = document.getElementById('')
    this.expensiveService.getAllExpensives(this.idWhStoreSelected, this.monthProfit).subscribe({
      next: (res: any) => {
        this.allExpensives = res?.result
        this.totalSell = res?.total_amount_sales_month
        this.totalExpense = res?.total_expense_amount
        this.totalBuy = res?.total_purchase_price
        this.profit = res?.profit
        this.isLoading = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoading = false
        showError(err, err.status, this.errors, err.error, btnClose);
      }
    })
  }


  exportToPdf() {
    if (this.monthProfit && this.idWhStoreSelected) {
      // --- FORMATTER FIX: replace narrow NBSP with normal space ---
      const numberFormat = new Intl.NumberFormat('fr-FR', { useGrouping: true });
      const formatPrice = (value: any) => {
        return numberFormat
          .format(Number(value))      // Format in French
          .replace(/\u202F/g, ' ');   // Replace narrow NBSP with plain space
      };

      const doc = new jsPDF();

      // Get warehouse name
      const nameWhStor = this.warehouses.find(
        (whStor: Warehouse) => whStor?.id === Number(this.idWhStoreSelected)
      );
      // ---- TITLE ----
      doc.setFontSize(16);
      doc.text(`Rapport des dépenses : ${nameWhStor?.nameWh || ''}`, 14, 15);

      // ---- TOTALS ----
      doc.setFontSize(11);
      doc.text(`Total ventes : ${formatPrice(this.totalSell)} ${this.devise}`, 14, 25);
      doc.text(`Total achats : ${formatPrice(this.totalBuy)} ${this.devise}`, 14, 32);
      doc.text(`Total dépenses : ${formatPrice(this.totalExpense)} ${this.devise}`, 14, 39);
      doc.text(`Profit : ${formatPrice(this.profit)} ${this.devise}`, 14, 46);

      // ---- TABLE ----
      autoTable(doc, {
        startY: 55,
        head: [['Dépense', 'Montant', 'Date']],
        body: this.allExpensives.map((item: any) => [
          item?.expense?.name || '',
          formatPrice(item?.amount) + ' ' + this.devise,
          new Date(item?.updated_at).toLocaleDateString('fr-FR')
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [51, 122, 183] } // Bleu Bootstrap
      });

      // ---- SAVE ----
      doc.save(`rapport_${nameWhStor?.nameWh || 'warehouse'}.pdf`);
    }
  }



}
