/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { PublicService } from 'src/app/services/public.service';
import { devises, invalidSelectValidator, isMobileApp, itermsNber, showError, toastShow, typesPayment } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QrCodeComponent } from 'ng-qrcode';
import { Enterprise, globalInterface } from 'src/app/interfaces/global';
import { TooltipComponent } from '../../application/reusableComponents/tooltip/tooltip.component';
import { CatalogService } from 'src/app/services/catalog.service';
import { AdminService } from 'src/app/services/admin.service';
import { SubmitSpinnerComponent } from '../../application/reusableComponents/submit-spinner/submit-spinner.component';
import { PrintService, PrinterDevice } from 'src/app/services/print.service'; // ✅
import { SpinnersComponent } from '../../application/reusableComponents/spinners/spinners.component';
import { BluetoothPrinterComponent } from "../../application/reusableComponents/bluetooth-printer/bluetooth-printer.component";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SharedModule, ImagePipe, QrCodeComponent, TooltipComponent, SubmitSpinnerComponent, SpinnersComponent, BluetoothPrinterComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  // @ViewChild('qrContainer') qrContainer!: ElementRef;
  @ViewChild('qrCanvas', { static: false }) qrCanvas: any;
  @ViewChildren('paymentRadio') paymentRadios!: QueryList<ElementRef<HTMLInputElement>>;

  settingsForm: FormGroup;
  otherSettingsForm: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;
  signaturePreview: string | ArrayBuffer | null = null;
  backgroundColor: string = '#ffffff';
  settingSite!: Enterprise;
  allDevises: globalInterface[] = [];
  logo: any = { name: '', file: '' };
  numericSignature: any = { name: '', file: '' };
  errors: any = [];
  items: any = [];
  whSecondary: boolean = false;
  okToSold: boolean = false;
  stockVerif: boolean = false;
  checkDefective: boolean = false;
  enableWhatsap: boolean = false;
  expiredProd: boolean = false;
  isPayment: boolean = false;
  typePayments!: any;
  adminSetting$ = this.publicService.adminSetting$;
  total: number = 0;
  quantity: number = 0;
  unitPrice: number = 0;
  manuelPayment: boolean = false;
  typePaymentSelected: string = '';
  isLoading: boolean = false;

  isMobileApp: boolean = false;
  accountsNbers!: any;
  imgPaymentManuelPreview: string = '';
  imgPaymentManuel: any = { name: '', file: '' };


  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private catalogService: CatalogService,
    private adminService: AdminService,
    private printService: PrintService // ✅
  ) {
    this.settingsForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      devise: ['0', [Validators.required, invalidSelectValidator]],
      background: ['#ffffff', Validators.required],
      signature: ['', Validators.required],
      rccm: [''],
      niu: ['']
    });
    this.otherSettingsForm = this.fb.group({
      urlSite: [''],
      urlDebt: [''],
      country: ['0', [Validators.required, invalidSelectValidator]],
      city: ['0', [Validators.required, invalidSelectValidator]],
      itemNber: ['0', [Validators.required, invalidSelectValidator]],
    });
  }

  async ngOnInit(): Promise<void> {
    // ✅ Restaure la connexion imprimante au démarrage
    await this.printService.restoreConnection(() => {
      toastShow('warning', 'Imprimante déconnectée');
    });

    this.isMobileApp = isMobileApp;
    this.allDevises = devises;
    this.items = itermsNber;
    this.typePayments = typesPayment;
    this.isLoading = true;

    this.publicService.getSettingEtprise().subscribe({
      next: (res: Enterprise) => {
        this.settingSite = res;
        this.logoPreview = this.settingSite?.logo || '';
        this.signaturePreview = this.settingSite?.signaturePreview || '';
        this.whSecondary = this.settingSite?.yesWhSecond;
        this.okToSold = this.settingSite?.grantAgencyToSell;
        this.stockVerif = this.settingSite?.stockVerif;
        this.expiredProd = this.settingSite?.expiredProd;
        this.checkDefective = this.settingSite?.defective;
        this.enableWhatsap = this.settingSite?.allowWhatsapp;
        this.backgroundColor = this.settingSite?.backgroundColor || '#ffffff';

        this.settingsForm.patchValue({
          name: this.settingSite?.nameEtprise || '',
          phone: this.settingSite?.phone || '',
          email: this.settingSite?.email || '',
          devise: this.settingSite?.devise || '0',
          signature: this.settingSite?.signature || '',
          rccm: this.settingSite?.rccm,
          niu: this.settingSite?.niu,
        });

        this.otherSettingsForm.patchValue({
          urlSite: this.settingSite?.url_site || '',
          urlDebt: this.settingSite?.url_debt || '',
          country: this.settingSite?.country || '0',
          city: this.settingSite?.city || '0',
          itemNber: this.settingSite?.itemNber || '0',
        });

        this.isLoading = false;
      },
      error: (err) => {
        toastShow('error', '❌ Erreur lors de la récupération des paramètres du site');
        this.isLoading = false;
      }
    });

    this.publicService.adminSetting$.subscribe(setting => {
      if (setting) {
        this.unitPrice = setting?.simple_whatsapp;
        this.calculateTotal();
      }
    });
  }

  // ngAfterViewInit() {
  //   const canvas = this.qrCanvas?.nativeElement?.querySelector('canvas');
  // }


  // ══════════════════════════════════════════════
  // PARAMÈTRES
  // ══════════════════════════════════════════════

  onPaymentChange(payment: string) {
    this.typePaymentSelected = payment;
    if (payment === 'manuel') {
      this.manuelPayment = true;
      this.catalogService.getMyPayments().subscribe({
        next: (res) => { this.accountsNbers = res?.result || []; },
        error: (err) => { console.error('Erreur lors de la récupération des méthodes de paiement :', err); }
      });
    } else {
      this.manuelPayment = false;
    }
  }

  calculateTotal(value?: number) {
    const qty = value ?? this.quantity;
    this.total = qty * this.unitPrice;
  }

  onNumericSignatureChange(event: any) {
    this.isLoading = true;
    const reader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.signaturePreview = reader.result as string;
        this.numericSignature.name = file.name;
        this.numericSignature.file = reader.result;
        const data = { checker: 'numericSignature', data: this.numericSignature };
        this.publicService.postSettingEtprise(data).subscribe({
          next: () => { toastShow('success', '✅ Signature mise à jour avec succès'); this.isLoading = false; this.errors = []; },
          error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); this.isLoading = false; }
        });
      };
      reader.onerror = () => { toastShow('error', '❌ Une erreur est survenue lors du chargement.'); };
    }
  }

  uploadPaymentManuel(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgPaymentManuelPreview = reader.result as string;
        this.imgPaymentManuel.name = file.name;
        this.imgPaymentManuel.file = reader.result;
      };
      reader.onerror = () => { toastShow('error', '❌ Une erreur est survenue lors du chargement.'); };
    }
  }

  confirmPayement() {
    if (this.typePaymentSelected === 'manuel') {
      this.isPayment = true;
      const data = {
        checker: 'paymentWhatsappMsg',
        typePayment: 'manuel',
        nbreWhatasapp: this.quantity,
        imgPayment: this.imgPaymentManuel
      };
      this.adminService.postInvoice(data).subscribe({
        next: () => {
          toastShow('success', '✅ Paiement traité avec succès');
          this.errors = [];
          this.quantity = 0;
          this.total = 0;
          this.typePaymentSelected = '';
          this.manuelPayment = false;
          this.imgPaymentManuel = { name: '', file: '' };
          this.imgPaymentManuelPreview = '';
          this.isPayment = false;
          this.paymentRadios.forEach(radio => { radio.nativeElement.checked = false; });
          document.getElementById('closeModalPayment')?.click();
        },
        error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); this.isPayment = false; }
      });
    }
  }

  onLogoChange(event: any) {
    const reader = new FileReader();
    this.isLoading = true;
    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.logo.name = file.name;
        this.logo.file = reader.result;
        const data = { checker: 'logo', data: this.logo };
        this.publicService.postSettingEtprise(data).subscribe({
          next: () => { toastShow('success', '✅ Logo mis à jour avec succès'); this.errors = []; this.isLoading = false; },
          error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); this.isLoading = false; }
        });
      };
      reader.onerror = () => { toastShow('error', '❌ Une erreur est survenue lors du chargement du logo.'); };
    }
  }

  saveWarehouseOther(event: any) {
    this.whSecondary = event.target.checked;
    this.isLoading = true;
    const data = { checker: 'whStore', data: this.whSecondary };
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => { toastShow('success', '✅ Mis à jour avec succès'); this.errors = []; this.isLoading = false; },
      error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); this.isLoading = false; }
    });
  }

  saveWareOkToSold(event: any) {
    this.okToSold = event.target.checked;
    const data = { checker: 'grantSold', data: this.okToSold };
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => { toastShow('success', '✅ Mis à jour avec succès'); this.errors = []; },
      error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); }
    });
  }

  saveStockVerification(event: any) {
    this.stockVerif = event.target.checked;
    const data = { checker: 'stockVerif', data: this.stockVerif };
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => { toastShow('success', '✅ Mis à jour avec succès'); this.errors = []; },
      error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); }
    });
  }

  saveCheckDefectiveProd(event: any) {
    this.checkDefective = event.target.checked;
    const data = { checker: 'defective', data: this.checkDefective };
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => { toastShow('success', '✅ Mis à jour avec succès'); this.errors = []; },
      error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); }
    });
  }

  enableWhatsappMsg(event: any) {
    this.enableWhatsap = event.target.checked;
    const data = { checker: 'whatsapp', data: this.enableWhatsap };
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => { toastShow('success', '✅ Mis à jour avec succès'); this.errors = []; },
      error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); }
    });
  }

  enableExpiredProduct(event: any) {
    this.expiredProd = event.target.checked;
    const data = { checker: 'expired', data: this.expiredProd };
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => { toastShow('success', '✅ Mis à jour avec succès'); this.errors = []; },
      error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); }
    });
  }

  onBackgroundChange(event: any) {
    this.backgroundColor = event.target.value;
    this.settingsForm.patchValue({ background: this.backgroundColor });
  }

  saveSettings() {
    this.isLoading = true;
    if (this.settingsForm.valid) {
      const payload = { checker: 'setting', data: this.settingsForm?.value };
      this.publicService.postSettingEtprise(payload).subscribe({
        next: () => { toastShow('success', '✅ Paramètres mis à jour avec succès'); this.errors = []; this.isLoading = false; },
        error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); this.isLoading = false; }
      });
    }
  }

  saveOtherSettings() {
    this.isLoading = true;
    if (this.otherSettingsForm.valid) {
      const payload = { checker: 'other', data: this.otherSettingsForm?.value };
      this.publicService.postSettingEtprise(payload).subscribe({
        next: () => { toastShow('success', '✅ Paramètres mis à jour avec succès'); this.errors = []; this.isLoading = false; },
        error: (err) => { this.errors = err?.error?.errors || []; showError(err, err.status, this.errors, err.error); this.isLoading = false; }
      });
    }
  }

  // downloadQRCode() {
  //   const canvas: HTMLCanvasElement | null = this.qrContainer.nativeElement.querySelector('canvas');
  //   if (!canvas) { console.error('QR Code canvas not found.'); return; }
  //   const imageData = canvas.toDataURL('image/png');
  //   const a = document.createElement('a');
  //   a.href = imageData;
  //   a.download = 'qr-code.png';
  //   a.click();
  // }

  downloadQRCode() {
    const canvas = this.qrCanvas.qrcElement.nativeElement.querySelector('canvas');
    const image = canvas.toDataURL('image/png');

    const a = document.createElement('a');
    a.href = image;
    a.download = 'qrcode.png';
    a.click();
  }

  //   downloadQRCodeDebt() {
  //   const canvas: HTMLCanvasElement | null = this.qrContainer.nativeElement.querySelector('canvas');
  //   if (!canvas) { console.error('QR Code canvas not found.'); return; }
  //   const imageData = canvas.toDataURL('image/png');
  //   const a = document.createElement('a');
  //   a.href = imageData;
  //   a.download = 'qr-code.png';
  //   a.click();
  // }

  sendPayment() {
    this.publicService.createPayment({ amount: 5000 }).subscribe({
      next: (res: any) => { console.log('Payment created successfully', res); },
      error: (err) => {
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalStock'));
      }
    });
  }
}