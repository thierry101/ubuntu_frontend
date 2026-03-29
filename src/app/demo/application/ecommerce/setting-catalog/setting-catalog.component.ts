/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingCatalog } from 'src/app/interfaces/global';
import { ImagePipe } from 'src/app/pipes/image.pipe';
import { CatalogService } from 'src/app/services/catalog.service';
import { itermsNber, showError, toastShow } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from '../../reusableComponents/submit-spinner/submit-spinner.component';

@Component({
  selector: 'app-setting-catalog',
  standalone: true,
  imports: [SharedModule, ImagePipe, SpinnersComponent, SubmitSpinnerComponent],
  templateUrl: './setting-catalog.component.html',
  styleUrl: './setting-catalog.component.scss'
})
export class SettingCatalogComponent implements OnInit, AfterViewInit {
  bannerPreview: string | ArrayBuffer | null = null;
  selectedBannerFile!: File;
  formSettingsCatalog!: FormGroup
  errors: any = [];
  settingCatalog!: SettingCatalog
  isLoading: boolean = false
  isValidCommand: boolean = false
  nberItems: any = itermsNber

  constructor(private fb: FormBuilder, private catalogService: CatalogService) {
    this.formSettingsCatalog = this.fb.group({
      facebookLink: [''],
      instagramLink: [''],
      whatsappLink: [''],
      enablePromotion: false,
      randomAffect: false,
      textPromotion: '',
      nbrItems: 20,
      barColor: '#FFFFFF',
      bgColor: '#FFFFFF',
      whatsappMsg: '',
    });
  }

  ngOnInit(): void {
    this.isLoading = true
    this.isValidCommand = true
    this.catalogService.getSettingCatalog().subscribe({
      next: (res) => {
        this.settingCatalog = res?.result;
        this.formSettingsCatalog.patchValue({
          facebookLink: this.settingCatalog?.facebook,
          instagramLink: this.settingCatalog?.instagram,
          whatsappLink: this.settingCatalog?.whatsapp,
          enablePromotion: this.settingCatalog?.enable_promotion,
          randomAffect: this.settingCatalog?.random_affect,
          textPromotion: this.settingCatalog?.text_promotion,
          barColor: this.settingCatalog?.bar_color || '#FFFFFF',
          bgColor: this.settingCatalog?.bg_color || '#FFFFFF',
          nbrItems: this.settingCatalog?.nber_items || 20,
          whatsappMsg: this.settingCatalog?.whatsapp_msg || '',
        });
        this.bannerPreview = this.settingCatalog?.banner;
        this.isLoading = false
        this.isValidCommand = false
      }
    });
  }


  ngAfterViewInit() {
    const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(el => {
      new (window as any).bootstrap.Popover(el);
    });
  }


  onBannerSelected(event: Event) {
    this.isLoading = true
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) { return; }

    this.selectedBannerFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.bannerPreview = reader.result;
      const data = { checker: 'bannerCatalog', data: this.bannerPreview }
      this.catalogService.postSettingCatalog(data).subscribe({
        next: () => {
          toastShow('success', "✅ Bannière du catalogue mis à jour avec succès !");
          this.errors = []
          this.isLoading = false
        },
        error: (err) => {
          this.errors = [];
          this.isLoading = false
          this.errors = err.error.errors;
          showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
        }
      })
    };

    reader.readAsDataURL(this.selectedBannerFile);
  }


  isObject(value: any): boolean {
    return typeof value === 'object';
  }


  saveSettingCatalog() {
    this.isLoading = true
    const data = { checker: 'settingCatalog', data: this.formSettingsCatalog?.value }
    this.catalogService.postSettingCatalog(data).subscribe({
      next: () => {
        toastShow('success', "✅ Paramètres du catalogue enregistrés avec succès !");
        this.errors = []
        this.isLoading = false
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        this.isLoading = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCategory'));
      }
    })
  }
}
