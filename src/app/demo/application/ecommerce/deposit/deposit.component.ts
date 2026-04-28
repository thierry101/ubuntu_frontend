/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Enterprise, Orders, Warehouse } from 'src/app/interfaces/global';
import { AuthService } from 'src/app/services/auth.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { isMobileApp, setPaginationForInvoice, showError, toastShow, typesPayment } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from '../../reusableComponents/set-pagination/set-pagination.component';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SearchListComponent } from '../../reusableComponents/search-list/search-list.component';
import Swal from 'sweetalert2';
import { SmalInvoiceComponent } from "../../reusableComponents/smal-invoice/smal-invoice.component";
import { DeleteConfirmModalComponent } from "../../reusableComponents/delete-confirm-modal/delete-confirm-modal.component";
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SpinnersComponent, SearchListComponent, SmalInvoiceComponent, DeleteConfirmModalComponent],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.scss'
})
export class DepositComponent implements OnInit {
  isLoading: boolean = true;
  searchTerm: string = ''
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_orders: Orders[] = []
  selectWhShop: number = 0
  startDate: string = ''
  endDate: string = ''
  role: string = ''
  all_items!: any
  deposits!: any
  devise: string = ""
  nextDate: string = ''
  errors: any = []
  minDate: string = ''
  isLoadingDeposit: boolean = false
  warehouses: Warehouse[] = []
  amt_all_deposits: number = 0
  amt_deposit_colllected: number = 0
  rest_amt_deposit: number = 0
  item_of_deposit!: any
  order_to_print!: Orders
  settingEnterprise!: Enterprise
  previous_deposits!: any
  current_deposit!: any
  idOrder: number = 0
  defaultTypePayments = typesPayment;
  fetchedTypePayments: any[] = [];
  amounts: { [key: string]: number } = {};
  isLoadingItem: boolean = false
  isMobileApp: boolean = false;
  @ViewChild('tableToPrint23', { static: false }) tableToPrint!: ElementRef;


  constructor(private storeService: StoreService, private authService: AuthService, private publicService: PublicService,
    private printService: PrintService
  ) { }

  ngOnInit(): void {
    this.isMobileApp = isMobileApp
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
    this.role = this.authService.currentUser?.role
    this.fetchOrdersDeposit(1)
    this.publicService.getSettingEtpriseForCustomisation().subscribe({
      next: (res: { result: Enterprise, typePayments: any }) => {
        this.settingEnterprise = res?.result
        this.devise = res?.result?.devise
        // this.getTypePayments = res?.typePayments
      }
    })
    if (this.role === 'Admin' || this.role === 'Daf') {
      this.publicService.getWarehouseStore().subscribe({
        next: (res: { result: Warehouse[] }) => {
          this.warehouses = res?.result;
        }
      });
    }
  }

  onPageChange(page: number) {
    this.fetchOrdersDeposit(page);
  }

  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchOrdersDeposit(1);
  }

  fetchOrdersDeposit(page: number = 1) {
    this.isLoading = true;
    setPaginationForInvoice(this.storeService.getOrdersDeposit.bind(this.storeService), page, this.searchTerm,
      this.selectWhShop, (data: any) => {
        this.pagination = data;
        this.all_orders = data?.listItems;
        this.amt_all_deposits = data?.amount_collect_startDate
        this.amt_deposit_colllected = data?.amount_collect_day
        this.rest_amt_deposit = data?.amount_collect_rangeDate
        this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
        this.isLoading = false;
      },
      this.startDate,
      this.endDate,
    );
  }


  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchOrdersDeposit(1);
  }

  filterByWhStore() {
    this.fetchOrdersDeposit(1);
  }

  resetFilter() {
    this.startDate = '';
    this.endDate = '';
    this.selectWhShop = 0
    this.fetchOrdersDeposit(1);
  }

  itemToPrintDeposit(deposit: any) {
    this.current_deposit = deposit //Il s'agit du montant actuel sur lequel l'on clique pour l'impression
    const referenceDate = new Date(deposit?.created_at);
    // Filtrage
    this.previous_deposits = this.deposits.filter((item: any) => new Date(item.created_at) < referenceDate);
    console.log("previous are ", this.previous_deposits)
  }

  get allTotalAmountPaid(): number {
    const amount_last_deposit = this.previous_deposits?.reduce((sum: any, payment: any) => sum + parseFloat(payment?.amountPaid || 0), 0);
    return amount_last_deposit + parseFloat(this.current_deposit?.amountPaid)
  }

  registerNewDeposit() {
    this.isLoadingDeposit = true
    const data = {
      amtDeposit: this.amounts,
      nextDate: this.nextDate
    }
    this.storeService.postOrderCartDeposit(this.order_to_print?.id, data).subscribe({
      next: (res: any) => {
        this.deposits?.unshift(res?.result)
        this.order_to_print = res?.serializer_order
        this.all_items = this.order_to_print?.listItems
        this.amounts = {}
        this.nextDate = ''
        document.getElementById('closeModalCategory')?.click();
        toastShow('success', '✅ Dépôt enregistré avec succès')
        this.isLoadingDeposit = false
        this.errors = []
        this.fetchOrdersDeposit(1);
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoadingDeposit = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }

  deleteStock() {
    this.storeService.delOrder(this.idOrder).subscribe({
      next: () => {
        this.all_orders = this.all_orders.filter((order: any) => order?.id !== this.idOrder);
        this.fetchOrdersDeposit(1);
        toastShow('success', "✅ Facture supprimée avec succès");
        const closeM = document.getElementById('closeModalDelete01');
        closeM?.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalDelete01'));
      }
    });
  }

  deleteDeposit(deposit: any) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce dépôt?")) {
      this.storeService.delOrderCartDeposit(deposit?.id).subscribe({
        next: () => {
          this.deposits = this.deposits.filter((dep: any) => dep.id !== deposit?.id)
          toastShow('success', '✅ Dépôt supprimé avec succès')
        }, error: (err) => {
          this.errors = err.error.errors || [];
          showError(err, err.status, this.errors, err.error, document.getElementById('closeStock'));
        }
      })
    }
  }

  viewItems(item: any) {
    console.log("clicked")
    this.amounts = {}
    this.idOrder = item?.id
    this.isLoadingItem = true
    this.storeService.getOrderCartDeposit(item?.id).subscribe({
      next: (res: any) => {
        this.deposits = res?.result
        console.log("deposits ", this.deposits)
        this.order_to_print = res?.serializer_order
        this.all_items = this.order_to_print?.listItems
        this.isLoadingItem = false
        this.errors = []
        this.fetchedTypePayments = res?.serializerPayment || [];
      }, error: (err) => {
        this.errors = err.error.errors || [];
        this.isLoadingItem = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeStock'));
      }
    })
  }
  isInvoiceReady = false;

  itemToPrint(item: any) {
    this.idOrder = item?.id
    this.storeService.getOrderCartDeposit(item?.id).subscribe({
      next: (res: any) => {
        this.deposits = res?.result
        this.order_to_print = res?.serializer_order
        console.log("order_to_print ", this.order_to_print)
        this.item_of_deposit = this.deposits.reduce((latest: any, current: any) => { //recupère le premier acompte de la facture
          return new Date(current.created_at) < new Date(latest.created_at) ? current : latest;
        });
        // Laisser Angular rendre le composant enfant
        setTimeout(() => { this.isInvoiceReady = true; }, 200);
      }
    })
  }

  async printOrderAcompte(): Promise<void> {
    try {
      if (!this.tableToPrint) {
        console.error('Élément à imprimer introuvable');
        return;
      }

      const htmlElement = this.tableToPrint.nativeElement as HTMLElement;

      // Vérifie qu'une imprimante est connectée
      const printer = this.printService.getSelectedPrinter();
      if (!printer) {
        alert('Aucune imprimante connectée. Veuillez connecter une imprimante Bluetooth.');
        return;
      }

      // Impression
      await this.printService.print(htmlElement);
      alert('🖨️ Impression réussie !');

    } catch (error: any) {
      console.error('Erreur lors de l’impression :', error);
      alert('❌ Impossible d’imprimer : ' + (error?.message || error));
    }
  }

  trackByOderId(index: number, order: any): number {
    return order?.id; // or any unique field
  }

}
