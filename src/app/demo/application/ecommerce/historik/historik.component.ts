/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Enterprise, Orders, Warehouse } from 'src/app/interfaces/global';
import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';
import { setPaginationMultiParams, showError, toastShow, typeSales, typesPayment } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import Swal from 'sweetalert2';
import { PublicService } from 'src/app/services/public.service';
import { SmalInvoiceComponent } from "../../reusableComponents/smal-invoice/smal-invoice.component";
import { BigInvoiceComponent } from "../../reusableComponents/big-invoice/big-invoice.component";
import { DeleteConfirmModalComponent } from '../../reusableComponents/delete-confirm-modal/delete-confirm-modal.component';

@Component({
  selector: 'app-historik',
  standalone: true,
  imports: [SharedModule, SpinnersComponent, SetPaginationComponent, SearchListComponent, SmalInvoiceComponent, BigInvoiceComponent,
    DeleteConfirmModalComponent],
  templateUrl: './historik.component.html',
  styleUrl: './historik.component.scss'
})
export class HistorikComponent implements OnInit {
  isLoading: boolean = false
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  all_orders: Orders[] = []
  all_items!: any
  startDate: string = ''
  endDate: string = ''
  searchTerm: string = ''
  paymentSelected: any = 0
  role: string = ''
  getTypePayments!: any
  typePayments!: any
  devise: string = ""
  order_to_print!: Orders
  item_of_deposit !: any
  settingEnterprise!: Enterprise
  collect_day: number = 0
  collect_day_tva: number = 0
  // collect_day_startDate: number = 0
  collect_day_rangeDate: number = 0
  warehouses: Warehouse[] = []
  selectWhShop: number = 0
  typeTrans: any = 0
  errors: any = [];
  wordCheck: string = '';
  allTypes: any = typeSales
  idInvoice: number = 0

  constructor(private storeService: StoreService, private authService: AuthService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.role = this.authService.getRole?.role
    this.typePayments = typesPayment
    this.fetchOrders(1)
    this.publicService.getSettingEtpriseForCustomisation().subscribe({
      next: (res: { result: Enterprise, typePayments: any }) => {
        this.settingEnterprise = res?.result
        this.devise = res?.result?.devise
        this.getTypePayments = res?.typePayments
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

  filterByType() {
    this.fetchOrders(1)
  }


  filterWhStore() {
    this.fetchOrders(1)
  }


  getNameTypeOrder(typeOrder: any) {
    const theType = this.allTypes.find((t: any) => t.value === typeOrder)
    return theType?.name
  }


  fetchOrders(page: number = 1) {
    this.isLoading = true;
    setPaginationMultiParams(this.storeService.getOrders.bind(this.storeService), page, this.searchTerm, this.selectWhShop, (data: any) => {
      this.pagination = data;
      this.all_orders = data?.listItems;
      this.collect_day = data?.amount_collect_day
      this.collect_day_tva = data?.amount_collect_day_tva
      // this.collect_day_startDate = data?.amount_collect_startDate
      this.collect_day_rangeDate = data?.amount_collect_rangeDate
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false;
    },
      this.startDate,
      this.endDate,
      this.paymentSelected,
      true,
      this.typeTrans
    );
  }

  onPageChange(page: number) {
    this.fetchOrders(page);
  }

  // Stock pagination/search
  onSearchChangeStock(term: string) {
    this.searchTerm = term;
    this.fetchOrders(1);
  }

  filterStock() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      Swal.fire("La date de début ne peut pas être après la date de fin.");
      return;
    }
    this.fetchOrders(1);
  }

  deleteInvoice(item: any) {
    this.idInvoice = item?.id;
    this.wordCheck = '';
    this.errors = []
  }

  deleteStock() {
    this.storeService.delOrder(this.idInvoice).subscribe({
      next: () => {
        this.all_orders = this.all_orders.filter((order: any) => order?.id !== this.idInvoice);
        toastShow('success', "✅ Facture supprimée avec succès");
        this.fetchOrders(1)
        this.all_items = []
        const closeM = document.getElementById('closeModalDelete01');
        closeM?.click();
      },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalDelete01'));
      }
    });
  }

  resetFilter() {
    this.all_items = []
    this.startDate = '';
    this.endDate = '';
    this.selectWhShop = 0
    this.paymentSelected = 0;
    this.typeTrans = 0
    this.fetchOrders(1);
  }


  filterByPayment(){
    this.fetchOrders(1);
  }


  get returnPayment() { //usefull to edit name payment in cart
    if (['0', 0].includes(this.paymentSelected)) {
      return 'Tout'
    }
    else {
      const match = this.typePayments.find((item: any) => item.value === this.paymentSelected);
      return match ? match.name : this.paymentSelected;
    }
  }


  viewItems(idItem: any) {
    this.storeService.getInvoiceDetail(idItem).subscribe({
      next: (res: any) => {
        this.order_to_print = res?.result
        console.log("historik ", this.order_to_print)
        this.all_items = this.order_to_print?.listItems
        this.item_of_deposit = res?.deposit
        console.log("the deposit is ", this.item_of_deposit)
      }
    })
  }


  trackByOderId(index: number, order: any): number {
    return order?.id; // or any unique field
  }

}
