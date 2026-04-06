/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Client, CommandsCatalog, Product, Warehouse } from 'src/app/interfaces/global';
import { CatalogService } from 'src/app/services/catalog.service';
import { PublicService } from 'src/app/services/public.service';
import { setPagination, setPaginationMultiParams, showError, toastShow, workflowCommand } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SearchListComponent } from "../../reusableComponents/search-list/search-list.component";
import { SetPaginationComponent } from "../../reusableComponents/set-pagination/set-pagination.component";
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-commands-catalog',
  standalone: true,
  imports: [SharedModule, SearchListComponent, SetPaginationComponent, SpinnersComponent, SelectedComponent],
  templateUrl: './commands-catalog.component.html',
  styleUrl: './commands-catalog.component.scss'
})
export class CommandsCatalogComponent implements OnInit {

  role: string = ''
  isLoading: boolean = false
  warehouses: Warehouse[] = []
  searchTermCmd: string = ''
  idWhStore: number = 0
  pages: number[] = [];
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  startDate: string = ''
  endDate: string = ''
  allCmdsCatalog: CommandsCatalog[] = []
  msgWhatsapp: string = ""
  templateMsgWhatsapp: string = ""
  nberWhatsapp: string = ""
  storWhSelect: number = 0
  devise: string = ''
  order = {
    warehouse: { id: null, nameWh: '' },
  };
  errors!: any
  errorsByOrder: { [key: number]: any } = {};
  permissions: string[] = [];
  roleAccessWhStor!: any
  selectedOrderId: number | null = null; // ✅ ID de la commande sélectionnée
  adminHasWarehouse: boolean = false;
  userInfo!: any
  feeDelivery: number = 0
  totalCmd: number = 0
  totalCmdInitial!: number;
  currentCommand!: CommandsCatalog;
  cmdWorkflow!: any
  urlTracking: string = ''
  searchTermP: string = ''
  all_products: Product[] = [];
  currentPrice: number = 0
  nameProduct: string = ''
  quantity: number = 0
  selectedProduct!: any;
  items: any[] = [];
  searchClient: string = ''
  all_clients: Client[] = [];
  idClient: number = 0
  statusPayment: boolean = false
  costDelivery: number = 0
  addressDelivery: string = ''


  constructor(private catalogService: CatalogService, private publicService: PublicService, private authService: AuthService, private storeService: StoreService) { }

  ngOnInit(): void {
    this.roleAccessWhStor = ["SiteAdmin", "Agent", "Agency", "Seller"]
    this.cmdWorkflow = workflowCommand
    this.fetchCommands(1)
    this.userInfo = this.authService.currentUser
    this.role = this.userInfo?.role
    if (this.role === 'Admin') {
      this.adminHasWarehouse = !!this.userInfo.whStore;
    }
    this.publicService.enterpriseCustomisation$.subscribe({
      next: (res: any) => {
        this.devise = res?.devise;
      }
    });

    this.permissions = this.authService.currentPermissions ?? [];
  }


  fetchProducts(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    setPagination(this.storeService.getProductsForStore.bind(this.storeService), page, this.searchTermP, (data: any) => {
      this.pagination = data;
      // this.editSoldPrice = data?.editSoldPrice;
      this.all_products = data?.listItems;
      // this.all_products.forEach((product: any) => this.getRigthPrice(product));
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
    })
  }


  getRigthPrice(product: any) {
    if (!product) return 0;

    let price = Number(product.sellPrice) || 0;

    if (product?.active_promotion) {
      const percentage = Number(product.active_promotion.percentage) || 0;
      price = price - (price * percentage / 100);
    }
    this.currentPrice = price
  }



  searchProduct(term: string) {
    this.searchTermP = term;
    this.fetchProducts(1); // or whatever logic you use
  }


  selectProduct(produ: any): void {
    this.getRigthPrice(produ)
    // this.selectedProduct = produ
    if (produ?.product && produ?.product !== this.searchTermP) {
      this.searchTermP = produ?.indiceStock;
      this.nameProduct = produ?.product?.name
      this.quantity = 1
      this.all_products = []
    }
  }


  fetchClients(page: number = 1): void {
    this.storeService.getClients(page, this.searchClient).subscribe({
      next: (data: any) => {
        this.all_clients = data?.results || [];
      }
    });
  }


  searchClients(term: string): void {
    this.searchClient = term;
    this.fetchClients(1);
  }


  selectClient(client: Client): void {
    if (client?.name && client.name !== this.searchClient) {
      this.idClient = client.id;
      this.searchClient = client.name;
      // this.clientInfo = {
      //   phone: client.phone,
      //   email: client.email
      // };
    }
  }


  fetchCommands(page: number = 1) {
    this.isLoading = true;
    setPaginationMultiParams(this.catalogService.getCommands.bind(this.catalogService), page, this.searchTermCmd, this.idWhStore, (data: any) => {
      this.pagination = data;
      this.templateMsgWhatsapp = this.pagination?.amount_collect_day_tva
      this.urlTracking = this.pagination?.amount_collect_startDate
      this.warehouses = this.pagination?.amount_collect_day
      this.allCmdsCatalog = data?.listItems;
      this.allCmdsCatalog = data?.listItems.map((order: any) => {
        if (!order?.warehouse) {
          order.warehouse = { id: null, nameWh: '' };
        }
        return order;
      });
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false;
    },
      this.startDate,
      this.endDate,
      true,
    );
  }


  onSearchChangeStock(term: string) {
    this.searchTermCmd = term;
    this.fetchCommands(1);
  }


  onPageChange(page: number) {
    this.fetchCommands(page);
  }


  printOrder(order: CommandsCatalog) {

    const printWindow = window.open('', '_blank', 'width=300,height=650');
    if (!printWindow) return;

    const statusText = order?.status_command ? 'PAYÉE' : 'PAIEMENT EN ATTENTE';

    const itemsHtml = order?.listItems.map(item => `
    <div class="item">
      ${item.quantity} x ${item.product.name}
      ${item.size && item.size !== 'undefined'
        ? `<div class="sub">Taille : ${item.size}</div>` : ''}
      ${item.color
        ? `<div class="sub">Couleur : ${item.color}</div>` : ''}
    </div>
  `).join('');

    const totalCmd = Number(order?.total_command);
    const fee = Number(order?.fee_delivery || 0);
    const allTotal = totalCmd + fee;

    printWindow.document.write(`
    <html>
      <head>
        <title>Commande ${order?.nber_command}</title>
        <style>
          @media print {
            body {
              width: 80mm;
              margin: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
          }

          body {
            width: 80mm;
            padding: 10px;
          }

          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .item { margin-bottom: 6px; }
          .sub {
            font-size: 11px;
            margin-left: 10px;
          }
        </style>
      </head>

      <body onload="window.print(); window.close();">

        <div class="center bold">
          Commande : ${order?.nber_command}
        </div>

        <div class="divider"></div>

        <div>
          Client : ${order?.client.name}<br>
          Tel : ${order?.client.phone}
        </div>

        <div class="divider"></div>

        ${itemsHtml}

        <div class="divider"></div>

        <div>
          Livraison : ${order?.delivery}<br>
          Ville : ${order?.city}
        </div>

        <div class="divider"></div>

        <div>
          Sous-total : ${totalCmd.toLocaleString()} XOF<br>
          Frais livraison : ${fee.toLocaleString()} XOF<br>
          <strong>Total : ${allTotal.toLocaleString()} XOF</strong>
        </div>

        <div class="divider"></div>

        <div class="center bold">
          STATUT : ${statusText}
        </div>

        <div class="divider"></div>

        <div class="center">
          Merci pour votre confiance 🙏
        </div>

      </body>
    </html>
  `);

    printWindow.document.close();
  }


  affectWhStor(order: CommandsCatalog) {
    const data = { checker: 'whStor', warehouseId: order?.warehouse?.id };

    // 🔹 Réinitialiser l’erreur pour cette ligne
    this.errorsByOrder[order?.id] = null;

    Swal.fire({
      title: "Êtes-vous sûr(e) de votre choix ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.catalogService.putAffectCmd(data, order?.id).subscribe({
          next: () => {
            toastShow('success', '✅ Boutique affectée avec succès.')
          },
          error: (err) => {
            // ✅ Stocker l’erreur uniquement pour cette commande
            this.errorsByOrder[order?.id] = err.error?.errors || {};
          }
        });
      }
    });
  }


  changeStatusTracking(order: CommandsCatalog) {
    const idModal = document.getElementById('')
    const data = { checker: 'statusOrder', statusOrder: order?.tracking_status }
    Swal.fire({
      title: "Êtes-vous sûr(e) de votre choix ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.catalogService.putAffectCmd(data, order?.id).subscribe({
          next: () => {
            toastShow('success', '✅ Statut modifié avec succès.')
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, idModal);
          }
        });
      }
    });
  }


  changePaymentOrder(order: CommandsCatalog) {
    const idModal = document.getElementById('')
    const data = { checker: 'paymentState', statusPayment: order?.status_command }
    Swal.fire({
      title: "Êtes-vous sûr(e) de votre choix ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.catalogService.putAffectCmd(data, order?.id).subscribe({
          next: () => {
            toastShow('success', '✅ Paiement modifié avec succès.')
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, idModal);
          }
        });
      }
    });
  }


  addItem() {

    // nettoyage
    const qty = Number(this.quantity);
    const price = Number(this.currentPrice);

    if (!this.searchTermP || !this.nameProduct?.trim()) {
      alert('Veuillez sélectionner un article et renseigner le nom.');
      return;
    }

    if (qty <= 0) {
      alert('La quantité doit être supérieure à 0.');
      return;
    }

    if (price <= 0) {
      alert('Le prix doit être supérieur à 0.');
      return;
    }

    const item = {
      // product: this.selectedProduct,
      name: this.nameProduct.trim(),
      price,
      quantity: qty,
      total: price * qty
    };

    this.items.push(item);

    // reset champs
    this.searchTermP = '';
    // this.selectedProduct = null;
    this.nameProduct = '';
    this.currentPrice = 0;
    this.quantity = 0;
  }


  removeItem(index: number) {
    this.items.splice(index, 1);
  }


  get grandTotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }


  generateWhatsappMessage() {
    if (!this.currentCommand) return;

    const command = this.currentCommand;

    const ordersString = command.listItems
      .map((item: any) =>
        `${item.quantity} x ${item.product.name}`
        + (item.size && item.size !== 'undefined' ? ` (taille: ${item.size})` : '')
        + (item.color ? ` (couleur: ${item.color})` : '')
      )
      .join(', ');

    this.msgWhatsapp = this.templateMsgWhatsapp
      .replace('{name}', command.client?.name || '')
      .replace('{nber_cmd}', command.nber_command || '')
      .replace('{orders}', ordersString)
      .replace('{location}', command.delivery || '')
      .replace('{fee}', `${this.feeDelivery || 0} ${this.devise}`)
      .replace('{total}', `${this.totalCmdInitial} ${this.devise}`)
      .replace('{allTotal}', `${this.totalCmd || this.totalCmdInitial} ${this.devise}`);

    this.nberWhatsapp = command.client?.phone;
  }


  sendWhatsappDetail(command: CommandsCatalog) {
    this.currentCommand = command;
    this.totalCmdInitial = Number(command.total_command);
    this.feeDelivery = Number(command?.fee_delivery);
    this.totalCmd = Number(this.totalCmdInitial) + this.feeDelivery;
    this.generateWhatsappMessage();
  }


  calculateFeeDelivery() {
    const fee = Number(this.feeDelivery) || 0;
    this.totalCmd = this.totalCmdInitial + fee;
    // 🔁 mettre à jour le message automatiquement
    this.generateWhatsappMessage();
  }


  isObject(value: any): boolean {
    return typeof value === 'object';
  }


  sendWhatsapp() {
    const idModal = document.getElementById('closeModalWhasapp001')
    this.msgWhatsapp += `\n\n\n Cliquez sur ce lien pour suivre le statut de votre commande : ${this.urlTracking}`;
    const data = { checker: 'msg', feeDelivery: this.feeDelivery, msgWhatsapp: this.msgWhatsapp, idCommand: this.currentCommand?.id }
    this.catalogService.putAffectCmd(data, this.currentCommand?.id).subscribe({
      next: () => {
        this.fetchCommands(1)
        idModal?.click()
        const url = `https://wa.me/${this.nberWhatsapp}?text=${encodeURIComponent(this.msgWhatsapp)}`;
        window.open(url, '_blank'); // Ouvre WhatsApp Web / App
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, idModal);
      }
    })

  }


  selectOrder(order: any): void {
    // Toggle : si on clique sur la même ligne, on la désélectionne
    if (this.selectedOrderId === order?.id) {
      this.selectedOrderId = null;
    } else {
      this.selectedOrderId = order?.id;
    }
  }


  clickOutside() {
    this.all_clients = []
    this.all_products = []
  }
}
