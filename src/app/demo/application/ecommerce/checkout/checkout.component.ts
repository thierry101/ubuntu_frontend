/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Angular imports
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { StoreService } from 'src/app/services/store.service';
import { CartProducts, Client, Discount, Orders, Product, Provider, Warehouse } from 'src/app/interfaces/global';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { isMobileApp, showError, SwallModal, toastShow, typeSales, typesPayment } from 'src/app/share/shared';
import { SelectedComponent } from "../../reusableComponents/selected/selected.component";
import { SmalInvoiceComponent } from "../../reusableComponents/smal-invoice/smal-invoice.component";
import { BigInvoiceComponent } from "../../reusableComponents/big-invoice/big-invoice.component";
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { Subject, takeUntil } from 'rxjs';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubmitSpinnerComponent } from '../../reusableComponents/submit-spinner/submit-spinner.component';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ImagePipe,
    SelectedComponent,
    SmalInvoiceComponent,
    BigInvoiceComponent,
    SpinnersComponent,
    SubmitSpinnerComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartProds: CartProducts[] = [];
  tableProdsTrocks!: any
  all_products: Product[] = [];
  oneProvider!: Provider;
  mainWarehouses: Warehouse[] = [];
  productsAdd: any[] = [];
  formProduct: FormGroup;
  searchTerm: string = '';
  devise: string = '';
  commentInvoice: string = '';
  defaultTypePayments = typesPayment;
  fetchedTypePayments: any[] = [];
  amounts: { [key: string]: number } = {};
  totalTVA: number = 0;
  totalTTC: number = 0;
  searchClient: string = '';
  errors: any = [];
  all_clients: Client[] = [];
  createClient: boolean = false;
  isValidCommand: boolean = false;
  shBtnCreate: boolean = false;
  clientInfo: Partial<Client> = {
    name: '',
    phone: '',
    email: ''
  };
  idClient: number = 0;
  order_to_print!: Orders;
  isLoading: boolean = false;
  codeDiscount: string = ''
  checkVerifCoupon: boolean = false
  couponChecked?: Discount
  amountDiscount: number = 0
  paymentStatus: boolean = true // true = total , false = partiel
  nextDate: string = ''
  amountAdvanced: number = 0
  item_of_deposit!: any
  settingShop!: Warehouse
  typesSale!: any
  choiceType: string = 'sell'
  productEntry = {
    id_product: 0,
    nameProduct: '',
    reference: '',
    quantity: 0,
    barCode: '',
    stateProd: 'secondHand'
  };
  previousChoice: string | null = null;
  private destroy$ = new Subject<void>();  // Propriétés
  discoveredPrinters: BleDevice[] = [];
  selectedPrinter: BleDevice | null = null;
  scanningPrinters = false;
  connectingPrinter = false;
  connectingId = '';
  printerSearchDone = false;
  isMobileApp: boolean = false;


  constructor(private storeService: StoreService, private articleManagementService: ArticleManagementService,
    private fb: FormBuilder
  ) {
    this.formProduct = this.fb.group({
      product: [],
      // provider: 0,
      whSelected: 0,
      provider_id: [{ value: 0, disabled: true }],
    });
  }

  ngOnInit(): void {
    this.isMobileApp = isMobileApp
    this.isLoading = true;
    this.typesSale = typeSales
    this.storeService.getCartProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: { result: CartProducts[], typePayments: any[], serializerShop: any, devise: string }) => {
          this.settingShop = res?.serializerShop
          if (!this.settingShop?.makeGift) {
            this.typesSale = this.typesSale.filter((typeSal: any) => typeSal.value !== 'gift');
          }
          if (!this.settingShop?.swapping) {
            this.typesSale = this.typesSale.filter((typeSal: any) => typeSal.value !== 'exchange');
          }
          this.isLoading = false;
          this.cartProds = res?.result || [];
          this.devise = res?.devise
          this.fetchedTypePayments = res?.typePayments || [];
          this.calculateTotals();
        },
        error: () => {
          this.isLoading = false;
        }
      });
    this.storeService.getOrderExchang().subscribe({
      next: (res: any) => {
        this.tableProdsTrocks = res?.prod_exchange
        this.mainWarehouses = res?.result
        if (this.tableProdsTrocks?.length > 0) {
          this.choiceType = 'exchange'
        }
      }
    })

    const saved = localStorage.getItem('posPrinter');
    if (saved) this.selectedPrinter = JSON.parse(saved);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  checkCoupon() {
    const data = {
      idClient: this.idClient,
      codeDiscount: this.codeDiscount
    }
    this.storeService.postCheckCoupon(data).subscribe({
      next: (res: any) => {
        this.couponChecked = res?.success
        if (this.couponChecked?.typeDiscount === 'amount') {
          this.amountDiscount = this.couponChecked?.amtDiscount
        }
        if (this.couponChecked?.typeDiscount === 'percentage') {
          this.amountDiscount = this.totalTTC * this.couponChecked?.percentage / 100
        }
        toastShow("success", "✅ Code validé")
        this.errors = []
        this.checkVerifCoupon = true
      },
      error: (err) => {
        this.checkVerifCoupon = false
        this.errors = err.error?.errors || [];
        this.couponChecked = undefined
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }


  fetchClients(page: number = 1): void {
    this.storeService.getClients(page, this.searchClient).subscribe({
      next: (data: any) => {
        this.all_clients = data?.results || [];
        this.shBtnCreate = this.all_clients?.length === 0 ? true : false;
      }
    });
  }


  deleteProductCart(item: CartProducts): void {
    this.storeService.delProdToCart(item.id).subscribe({
      next: () => {
        this.cartProds = this.cartProds.filter(p => p.id !== item.id);
        this.calculateTotals();
        toastShow('success', "✅ Article supprimé");
      }
    });
  }


  confirmCommand(): void {
    this.isValidCommand = true
    if (this.paymentStatus) {
      this.nextDate = ''
    }

    const clientInfos = this.idClient ? this.idClient : this.clientInfo;
    const data = {
      client: clientInfos, amount: this.amounts, amountDiscount: this.amountDiscount, commentInvoice: this.commentInvoice,
      codeDiscount: this.codeDiscount, paymentStatus: this.paymentStatus, nextDate: this.nextDate,
      amountAdvanced: 0, choiceType: this.choiceType, productsTroc: this.tableProdsTrocks
    };

    this.storeService.postOrder(data).subscribe({
      next: (res: any) => {
        document.getElementById('lauchModalPrint004')?.click();
        this.order_to_print = res?.result;
        this.item_of_deposit = res?.deposit
        this.choiceType = 'sell' //after success, reset the choiceType to sell
        this.isValidCommand = false
        toastShow("success", "✅ Commande validée");

        // Reset state
        this.cartProds = [];
        this.tableProdsTrocks = [];
        this.idClient = 0;
        this.searchClient = '';
        this.commentInvoice = '';
        this.errors = [];
        this.clientInfo = { name: '', phone: '', email: '' };
        this.amounts = {};
        this.totalTVA = 0;
        this.totalTTC = 0;
        this.amountDiscount = 0
        this.checkVerifCoupon = false
        this.codeDiscount = ''
        this.paymentStatus = true
        this.nextDate = ''
        this.amountAdvanced = 0
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        this.isValidCommand = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    });
  }


  createTheClient(): void {
    this.idClient = 0;
    this.createClient = true;
    this.errors = [];
    this.clientInfo = { name: this.searchClient };
  }

  searchClients(term: string): void {
    this.searchClient = term;
    this.fetchClients(1);
  }

  resetIfEmpty() {
    if (this.clientInfo.name === '') {
      this.createClient = false;
    }
  }


  selectClient(client: Client): void {
    if (client?.name && client.name !== this.searchClient) {
      this.idClient = client.id;
      this.searchClient = client.name;
      this.clientInfo = {
        phone: client.phone,
        email: client.email
      };
      this.shBtnCreate = false;
    }
  }


  clickedQty(item: CartProducts): void {
    if (item.quantity) {
      this.updateCartItem(item);
    }
  }


  plus(item: CartProducts): void {
    item.quantity += 1;
    this.updateCartItem(item);
  }


  minus(item: CartProducts): void {
    item.quantity = Math.max(1, item.quantity - 1);
    this.updateCartItem(item);
  }


  updateCartItem(item: CartProducts): void {
    this.storeService.editProdToCart(item.id, { qty: item.quantity }).subscribe({
      next: (res: { result: CartProducts }) => {
        this.cartProds = this.cartProds.map(prod =>
          prod.id === res.result.id ? res.result : prod
        );
        // this.amounts[item.id] = item.quantity;
        this.calculateTotals();
        this.errors = [];
        toastShow('success', "✅ Panier mis à jour");
      },
      error: (err) => {
        this.errors = err.error?.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    });
  }


  calculateTotals(): void {
    this.totalTVA = this.cartProds.reduce((acc: number, item: any) => {
      return acc + parseFloat(item?.amount_tva || '0');
    }, 0);

    this.totalTTC = this.cartProds.reduce((acc: number, sale: any) => {
      return acc + parseFloat(sale?.total_price || '0');
    }, 0);

  }


  searchProduct(term: string) {
    this.searchTerm = term;
    this.fetchProducts(1); // or whatever logic you use
    if (!term) {
      // if nothing is typed, reset the product entry
      this.productEntry.nameProduct = '' // Reset the product name in the entry
      this.productEntry.reference = '' // Reset the product reference in the entry
      this.productEntry.id_product = 0 // Reset the product ID in the entry
    }
  }


  selectProduct(produ: Product): void {
    if (produ?.name && produ.name !== this.searchTerm) {
      this.searchTerm = produ.name;
      this.productEntry.nameProduct = produ?.name // Set the product name in the entry
      this.productEntry.reference = produ?.code // Set the product reference in the entry
      this.productEntry.id_product = produ?.id // Set the product ID in the entry and send in backend
    }
  }


  fetchProducts(page: number = 1) {
    this.articleManagementService.getAllProducts(page, this.searchTerm).subscribe({
      next: (data: { results: Product[] }) => {
        this.all_products = data?.results;
      }
    });
  }


  lauchTrockModal() {
    this.resetModalTrock()
    const btnTrockModal = document.getElementById('modalLauchTroc002')
    if (this.choiceType === 'exchange') {
      this.paymentStatus = true
      btnTrockModal?.click()
    } else if ((this.choiceType === 'gift' || this.choiceType === 'sell') && this.tableProdsTrocks?.length > 0) {
      // Force the select to revert by using setTimeout
      setTimeout(() => {
        this.choiceType = 'exchange'; // or whatever the previous valid value was
      }, 100);

      SwallModal('error', "impossible de changer", "Supprimer les articles de troc avant de modifier le type de vente")
    }
  }


  onAddProduct() {
    const { id_product, nameProduct, reference, quantity, barCode, stateProd } = this.productEntry;

    if (!id_product || quantity <= 0 || !stateProd || !barCode) {
      SwallModal('warning', 'Remplir les champs', 'Veuillez remplir tous les champs correctement.')
      return;
    }

    const exists = this.productsAdd.some(
      (p: any) => p.id_product === id_product
    );

    if (exists) {
      alert('Ce produit avec cette référence a déjà été ajouté.');
      return;
    }

    // Push a copy of the current product into the list
    this.errors = []
    this.productsAdd.push({
      nameProduct,
      id_product,
      reference,
      quantity,
      barCode,
      stateProd
    });

    // Reset the form
    this.searchTerm = ""

    this.productEntry = {
      id_product: 0,
      nameProduct: '',
      reference: '',
      quantity: 0,
      barCode: '',
      stateProd: 'secondHand'
    };
  }

  resetModalTrock() {
    this.getProvider()
    this.errors = []
    this.productsAdd = []
    this.searchTerm = ""
    this.productEntry = {
      id_product: 0,
      nameProduct: '',
      reference: '',
      quantity: 0,
      barCode: '',
      stateProd: 'secondHand'
    };
    this.formProduct.patchValue({
      whSelected: 0,
      provider_id: 0
    })
  }


  removeItem(item: any) {
    this.productsAdd = this.productsAdd.filter((product: any) => product?.id_product !== item?.id_product);
  }


  saveProductExchange() {
    const idModal = document.getElementById('modalTrocProduct001')
    this.formProduct.patchValue({
      product: this.productsAdd,
    })
    const payload = this.formProduct?.getRawValue()
    this.storeService.postProductForOrderExchang(payload).subscribe({
      next: (res: any) => {
        this.tableProdsTrocks = res?.result
        idModal?.click()
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }


  deleteProductTroc(item: any) {
    this.storeService.deleteProductForOrderExchang().subscribe({
      next: () => {
        this.tableProdsTrocks = [];
        this.choiceType = 'sell'
      }
    })
  }


  getProvider() {
    this.articleManagementService.getOneProvider().subscribe({
      next: (res: { result: Provider }) => {
        this.oneProvider = res?.result;
        this.formProduct.patchValue({ provider_id: this.oneProvider?.id, disabled: true });
      }
    })
  }


  async scanPrinters() {
    try {
      this.scanningPrinters = true;
      this.discoveredPrinters = [];
      this.printerSearchDone = false;

      await BleClient.initialize({ androidNeverForLocation: false });

      await BleClient.requestLEScan({}, (result) => {
        const exists = this.discoveredPrinters.find(d => d.deviceId === result.device.deviceId);
        if (!exists && result.device.name) { // On filtre ceux qui ont un nom
          this.discoveredPrinters.push(result.device);
        }
      });

      // Scan pendant 5 secondes
      await new Promise(resolve => setTimeout(resolve, 5000));
      await BleClient.stopLEScan();

    } catch (err) {
      console.error(err);
      alert('Activez le Bluetooth et accordez les permissions nécessaires.');
    } finally {
      this.scanningPrinters = false;
      this.printerSearchDone = true;
    }
  }

  async connectToPrinter(device: BleDevice) {
    try {
      this.connectingPrinter = true;
      this.connectingId = device.deviceId;

      await BleClient.connect(device.deviceId);
      this.selectedPrinter = device;
      localStorage.setItem('posPrinter', JSON.stringify(device));

    } catch (err) {
      console.error(err);
      alert(`Impossible de se connecter à ${device.name || device.deviceId}`);
    } finally {
      this.connectingPrinter = false;
      this.connectingId = '';
    }
  }

  async disconnectPrinter() {
    try {
      if (this.selectedPrinter) {
        await BleClient.disconnect(this.selectedPrinter.deviceId);
      }
    } catch (err) {
      // Déconnexion déjà effectuée ou appareil inaccessible
      console.warn('Bluetooth disconnect warning:', err);
    }
    this.selectedPrinter = null;
    localStorage.removeItem('posPrinter');
  }


  resetClient(): void {
    this.createClient = false;
    this.shBtnCreate = false;
    this.searchClient = '';
    this.errors = [];
  }

  clickOutsideModal(): void {
    this.all_clients = [];
  }

  clickOutsideModalTroc() {
    this.all_products = [];
  }

  generateRandom8DigitNumber() {
    const min = 10000000; // Smallest 8-digit number (10^7)
    const max = 99999999; // Largest 8-digit number (10^8 - 1)
    this.productEntry.barCode = JSON.stringify(Math.floor(Math.random() * (max - min + 1)) + min) // Reset the product barCode in the entry
  }

  trackByItem(index: number, item: CartProducts): number {
    return item.id;
  }

}
