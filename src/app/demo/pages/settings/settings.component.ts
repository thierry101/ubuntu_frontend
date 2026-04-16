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
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { TooltipComponent } from '../../application/reusableComponents/tooltip/tooltip.component';
import { CatalogService } from 'src/app/services/catalog.service';
import { AdminService } from 'src/app/services/admin.service';
import { SubmitSpinnerComponent } from '../../application/reusableComponents/submit-spinner/submit-spinner.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SharedModule, ImagePipe, QrCodeComponent, TooltipComponent, SubmitSpinnerComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  @ViewChild('qrContainer') qrContainer!: ElementRef;
  @ViewChildren('paymentRadio') paymentRadios!: QueryList<ElementRef<HTMLInputElement>>;
  settingsForm: FormGroup;
  otherSettingsForm: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;
  signaturePreview: string | ArrayBuffer | null = null;
  backgroundColor: string = '#ffffff';
  settingSite !: Enterprise
  allDevises: globalInterface[] = []
  logo: any = { name: '', file: '' }
  numericSignature: any = { name: '', file: '' }
  errors: any = []
  items: any = []
  whSecondary: boolean = false
  okToSold: boolean = false
  stockVerif: boolean = false
  checkDefective: boolean = false
  enableWhatsap: boolean = false
  expiredProd: boolean = false
  isPayment: boolean = false
  typePayments!: any
  adminSetting$ = this.publicService.adminSetting$;
  total: number = 0
  quantity: number = 0
  unitPrice: number = 0
  manuelPayment: boolean = false
  typePaymentSelected: string = ''

  // Propriétés
  discoveredPrinters: BleDevice[] = [];
  selectedPrinter: BleDevice | null = null;
  scanningPrinters = false;
  connectingPrinter = false;
  connectingId = '';
  printerSearchDone = false;
  isMobileApp: boolean = false;
  accountsNbers!: any
  imgPaymentManuelPreview: string = '';
  imgPaymentManuel: any = { name: '', file: '' }

  constructor(private fb: FormBuilder, private publicService: PublicService, private catalogService: CatalogService,
    private adminService: AdminService
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
      country: ['0', [Validators.required, invalidSelectValidator]],
      city: ['0', [Validators.required, invalidSelectValidator]],
      itemNber: ['0', [Validators.required, invalidSelectValidator]],
    })
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.isMobileApp = isMobileApp
    this.allDevises = devises
    this.items = itermsNber
    this.typePayments = typesPayment
    this.publicService.getSettingEtprise().subscribe({
      next: (res: Enterprise) => {
        this.settingSite = res;
        this.logoPreview = this.settingSite?.logo || '';
        this.signaturePreview = this.settingSite?.signaturePreview || '';
        this.whSecondary = this.settingSite?.yesWhSecond
        this.okToSold = this.settingSite?.grantAgencyToSell
        this.stockVerif = this.settingSite?.stockVerif
        this.expiredProd = this.settingSite?.expiredProd
        this.checkDefective = this.settingSite?.defective
        this.enableWhatsap = this.settingSite?.allowWhatsapp
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
          country: this.settingSite?.country || '0',
          city: this.settingSite?.city || '0',
          itemNber: this.settingSite?.itemNber || '0',
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des paramètres du site :', err);
        // Optional: showError or toastShow can be added here
      }
    });

    this.publicService.adminSetting$.subscribe(setting => {
      if (setting) {
        this.unitPrice = setting?.simple_whatsapp;
        this.calculateTotal();
      }
    });

    const saved = localStorage.getItem('posPrinter');
    if (saved) this.selectedPrinter = JSON.parse(saved);
  }


  onPaymentChange(payment: string) {
    // Handle payment method change
    this.typePaymentSelected = payment;
    if (payment === 'manuel') {
      this.manuelPayment = true
      this.catalogService.getMyPayments().subscribe({
        next: (res) => {
          this.accountsNbers = res?.result || [];
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des méthodes de paiement :', err);
          // Optional: showError or toastShow can be added here
        }
      });
    } else {
      this.manuelPayment = false
    }
  }

  calculateTotal(value?: number) {
    const qty = value ?? this.quantity;
    this.total = qty * this.unitPrice;
  }

  ngAfterViewInit() {
    // Debug: Check if canvas is rendered
    const canvas = this.qrContainer?.nativeElement?.querySelector('canvas');
  }

  // ***************************** Update the logo image and numeric signature ************************************
  onNumericSignatureChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.signaturePreview = reader.result as string;
        this.numericSignature.name = file.name;
        this.numericSignature.file = reader.result;

        const data = {
          checker: 'numericSignature',
          data: this.numericSignature
        };

        this.publicService.postSettingEtprise(data).subscribe({
          next: () => {
            toastShow('success', '✅ Signature mise à jour avec succès');
            this.errors = [];
          },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error);
          }
        });
      };
      reader.onerror = (e) => {
        toastShow('error', '❌ Une erreur est survenue lors du chargement du logo.');
      };
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
      reader.onerror = (e) => {
        toastShow('error', '❌ Une erreur est survenue lors du chargement du logo.');
      };
    }
  }


  confirmPayement() {
    if (this.typePaymentSelected === 'manuel') {
      // Envoyer les données de paiement manuel à l'API
      this.isPayment = true
      const data = {
        checker: 'paymentWhatsappMsg',
        typePayment: 'manuel',
        nbreWhatasapp: this.quantity,
        imgPayment: this.imgPaymentManuel
      };
      this.adminService.postInvoice(data).subscribe({
        next: (res: any) => {
          toastShow('success', '✅ Paiement traité avec succès');
          this.errors = [];
          this.quantity = 0;
          this.total = 0;
          this.typePaymentSelected = '';
          this.manuelPayment = false;
          this.imgPaymentManuel = { name: '', file: '' };
          this.imgPaymentManuelPreview = '';
          this.isPayment = false
          // Décoche tous les radios visuellement
          this.paymentRadios.forEach(radio => {
            radio.nativeElement.checked = false;
          });
          document.getElementById('closeModalPayment')?.click()
        },
        error: (err) => {
          this.errors = err?.error?.errors || [];
          showError(err, err.status, this.errors, err.error);
          this.isPayment = false
        }
      })
    }
  }


  onLogoChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files[0]) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.logo.name = file.name;
        this.logo.file = reader.result;

        const data = {
          checker: 'logo',
          data: this.logo
        };

        this.publicService.postSettingEtprise(data).subscribe({
          next: () => {
            toastShow('success', '✅ Logo mis à jour avec succès');
            this.errors = [];
          },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error);
          }
        });
      };
      reader.onerror = (e) => {
        toastShow('error', '❌ Une erreur est survenue lors du chargement du logo.');
      };
    }
  }


  saveWarehouseOther(event: any) {
    this.whSecondary = event.target.checked
    const data = {
      checker: 'whStore',
      data: this.whSecondary
    }
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => {
        toastShow('success', '✅ Mis à jour avec succès');
        this.errors = [];
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }

  saveWareOkToSold(event: any) {
    this.okToSold = event.target.checked
    const data = {
      checker: 'grantSold',
      data: this.okToSold
    }
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => {
        toastShow('success', '✅ Mis à jour avec succès');
        this.errors = [];
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }

  saveStockVerification(event: any) {
    this.stockVerif = event.target.checked
    const data = {
      checker: 'stockVerif',
      data: this.stockVerif
    }
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => {
        toastShow('success', '✅ Mis à jour avec succès');
        this.errors = [];
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  saveCheckDefectiveProd(event: any) {
    this.checkDefective = event.target.checked
    const data = {
      checker: 'defective',
      data: this.checkDefective
    }
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => {
        toastShow('success', '✅ Mis à jour avec succès');
        this.errors = [];
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  enableWhatsappMsg(event: any) {
    this.enableWhatsap = event.target.checked
    const data = {
      checker: 'whatsapp',
      data: this.enableWhatsap
    }
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => {
        toastShow('success', '✅ Mis à jour avec succès');
        this.errors = [];
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }


  enableExpiredProduct(event: any) {
    this.expiredProd = event.target.checked
    const data = {
      checker: 'expired',
      data: this.expiredProd
    }
    this.publicService.postSettingEtprise(data).subscribe({
      next: () => {
        toastShow('success', '✅ Mis à jour avec succès');
        this.errors = [];
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        showError(err, err.status, this.errors, err.error);
      }
    })
  }

  onBackgroundChange(event: any) {
    this.backgroundColor = event.target.value;
    this.settingsForm.patchValue({ background: this.backgroundColor });
  }

  // ***************************** Update the settings form ************************************
  saveSettings() {
    if (this.settingsForm.valid) {
      const payload = {
        checker: 'setting',
        data: this.settingsForm?.value
      };

      this.publicService.postSettingEtprise(payload).subscribe({
        next: () => {
          toastShow('success', "✅ Paramètres mis à jour avec succès");
          this.errors = [];
        },
        error: (err) => {
          this.errors = err?.error?.errors || [];
          showError(err, err.status, this.errors, err.error);
        }
      });
    }
  }


  // ***************************** Update the other settings form ************************************
  saveOtherSettings() {
    if (this.otherSettingsForm.valid) {
      const payload = { checker: 'other', data: this.otherSettingsForm?.value };

      this.publicService.postSettingEtprise(payload).subscribe({
        next: () => {
          toastShow('success', "✅ Paramètres mis à jour avec succès");
          this.errors = [];
        },
        error: (err) => {
          this.errors = err?.error?.errors || [];
          showError(err, err.status, this.errors, err.error);
        }
      });
    }
  }


  // ***************************** Select city based on country selected ************************************ 
  // choiceCountry() {
  //   const result = this.countries.find((obj: any) => obj?.name === this.otherSettingsForm.get('country')?.value);
  //   this.cities = result?.cities
  // }

  // Download the qr code
  downloadQRCode() {
    const canvas: HTMLCanvasElement | null =
      this.qrContainer.nativeElement.querySelector('canvas');

    if (!canvas) {
      console.error('QR Code canvas not found.');
      return;
    }

    const imageData = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imageData;
    a.download = 'qr-code.png';
    a.click();
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


  sendPayment() {
    this.publicService.createPayment({ amount: 5000 }).subscribe({
      next: (res: any) => {
        console.log('Payment created successfully', res);
      },
      error: (err) => {
        console.log('Payment creation failed', err);
        this.errors = err.error.errors || [];
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalStock'));
      }
    }
    );
  }
}
// window.location.href = res.payment_url;