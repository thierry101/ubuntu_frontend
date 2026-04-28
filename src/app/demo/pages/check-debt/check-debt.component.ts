/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { PublicService } from 'src/app/services/public.service';
import { toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SpinnersComponent } from '../../application/reusableComponents/spinners/spinners.component';

@Component({
  selector: 'app-check-debt',
  standalone: true,
  imports: [SharedModule, SpinnersComponent],
  templateUrl: './check-debt.component.html',
  styleUrl: './check-debt.component.scss'
})
export class CheckDebtComponent implements OnInit {

  invoiceNumber: string = '';
  phone: string = '';

  client: any = null;
  deposits: any[] = [];
  order: any = null;

  currency: string = 'FCFA';

  totalDebt: number = 0;
  totalPaid: number = 0;
  progressPercent: number = 0;
  loading: boolean = false;
  isLate(date: string | null): boolean {
    if (!date) return false;

    const today = new Date();
    const paymentDate = new Date(date);

    return paymentDate < today;
  }


  constructor(private publicService: PublicService) { }

  ngOnInit(): void {
    console.log("check debt component initialized");
  }


  filterInvoice() {
    this.loading = true;

    this.publicService
      .getPaiementClient(this.invoiceNumber, this.phone)
      .subscribe({

        next: (res: any) => {
          this.loading = false;

          // ===== DATA =====
          this.client = res.client;
          this.order = res.order;
          this.currency = res.devise;

          // convertir les montants (IMPORTANT)
          this.deposits = res.deposits.map((d: any) => ({
            ...d,
            amountPaid: Number(d.amountPaid)
          }));

          this.totalDebt = Number(res.order.new_order_amount);

          // ===== CALCULS =====
          this.totalPaid = this.deposits.reduce(
            (sum: number, d: any) => sum + d.amountPaid,
            0
          );

          this.progressPercent =
            this.totalDebt > 0
              ? (this.totalPaid / this.totalDebt) * 100
              : 0;

          // 🔥 trier du plus récent au plus ancien (important UX)
          this.deposits.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
        },

        error: () => {
          this.loading = false;

          // reset UI
          this.client = null;
          this.deposits = [];

          // 👉 option UX
          toastShow('error', '❌ Facture introuvable ou informations incorrectes');
        }
      });
  }

}
