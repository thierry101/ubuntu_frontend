/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import { SubmitSpinnerComponent } from 'src/app/demo/application/reusableComponents/submit-spinner/submit-spinner.component';
import { Enterprise, globalInterface, OpenHour, Warehouse } from 'src/app/interfaces/global';
import { PublicService } from 'src/app/services/public.service';
import { devises, showError, toastShow, typesPayment, typesWarehouses } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-store-wh',
  standalone: true,
  imports: [SharedModule, SpinnersComponent, SubmitSpinnerComponent],
  templateUrl: './store-wh.component.html',
  styleUrl: './store-wh.component.scss'
})
export class StoreWhComponent implements OnInit, OnDestroy {
  titleModal: string = ''
  editWh: boolean = false
  editSt: boolean = false
  whToEdit!: Warehouse
  titleModalStore: string = ''
  typesWarehouse: globalInterface[] = []
  the_setting!: Enterprise
  errors: any = []
  warehouses: Warehouse[] = []
  filteredTypesWarehouses: globalInterface[] = [];
  formWarehouse: FormGroup
  typePayments!: any
  getTypePayments!: any
  isLoading: boolean = false
  isSaving: boolean = false
  selectedPayments: { name: string, value: string }[] = [];
  allDevises: globalInterface[] = []
  workSchedule = [
    { day: 'monday', label: 'Lundi', active: true, startTime: '08:00', endTime: '17:00' },
    { day: 'tuesday', label: 'Mardi', active: true, startTime: '08:00', endTime: '17:00' },
    { day: 'wednesday', label: 'Mercredi', active: true, startTime: '08:00', endTime: '17:00' },
    { day: 'thursday', label: 'Jeudi', active: true, startTime: '08:00', endTime: '17:00' },
    { day: 'friday', label: 'Vendredi', active: true, startTime: '08:00', endTime: '17:00' },
    { day: 'saturday', label: 'Samedi', active: false, startTime: '09:00', endTime: '13:00' },
    { day: 'sunday', label: 'Dimanche', active: false, startTime: '', endTime: '' },
  ];
  private destroy$ = new Subject<void>();


  constructor(private publicService: PublicService, private fb: FormBuilder) {
    this.formWarehouse = this.fb.group({
      name: '',
      typeWh: 0,
      phoneWh: '',
      localisation: '',
      invoiceIndice: '',
      noteCreditIndice:'',
      transferIndice: '',
      lotIndice: '',
      getCreditNote: true,
      collectTva: false,
      editSoldPrice: false,
      makeGift: false,
      rateTva: 0,
      configDaysWork: true,
      swapping: false,
    })
  }

  ngOnInit(): void {
    this.allDevises = devises
    this.isLoading = true;
    this.publicService.getWarehouseStore()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.warehouses = res?.result;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });

    this.publicService.enterpriseCustomisation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.the_setting = data;
          this.filterWarehouseTypes();
        }
      });
    this.typesWarehouse = typesWarehouses

    this.typePayments = typesPayment
  }

  // Toujours détruire les souscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  validateWorkHours(day: any) {
    if (day.active && day.startTime && day.endTime) {
      if (day.startTime > day.endTime) {
        toastShow('error', "L'heure d'ouverture est invalide");
        day.startTime = '08:00';
      }
    }
  }



  resetFormWh() {
    this.titleModal = "Créer entrepôt/boutique"
    this.workSchedule = [
      { day: 'monday', label: 'Lundi', active: true, startTime: '08:00', endTime: '17:00' },
      { day: 'tuesday', label: 'Mardi', active: true, startTime: '08:00', endTime: '17:00' },
      { day: 'wednesday', label: 'Mercredi', active: true, startTime: '08:00', endTime: '17:00' },
      { day: 'thursday', label: 'Jeudi', active: true, startTime: '08:00', endTime: '17:00' },
      { day: 'friday', label: 'Vendredi', active: true, startTime: '08:00', endTime: '17:00' },
      { day: 'saturday', label: 'Samedi', active: false, startTime: '09:00', endTime: '13:00' },
      { day: 'sunday', label: 'Dimanche', active: false, startTime: '', endTime: '' },
    ];
    this.errors = []
    this.editWh = false
    this.selectedPayments = []
    this.getTypePayments = []
    this.formWarehouse.patchValue({
      name: '',
      typeWh: 0,
      phoneWh: '',
      localisation: '',
      invoiceIndice: '',
      noteCreditIndice:'',
      transferIndice: '',
      lotIndice: '',
      collectTva: false,
      getCreditNote: true,
      editSoldPrice: false,
      makeGift: false,
      rateTva: 0,
      configDaysWork: true,
      swapping: false
    })
    if (this.warehouses?.length === 0) {
      this.filteredTypesWarehouses = (this.typesWarehouse || []).filter(
        typeWh => typeWh?.value === 'Principal'
      )
    }
    else {
      this.filterWarehouseTypes()
    }

  }

  saveWarehouse() {
    this.isSaving = true
    const data = {
      activeDays: this.workSchedule.filter(d => d.active),
      whStoreValue: this.formWarehouse?.value,
      payments: this.selectedPayments
    }
    this.publicService.postWarehouseStore(data).subscribe({
      next: (res: { warehouse: Warehouse }) => {
        if ('warehouse' in res) {
          this.warehouses?.unshift(res?.warehouse);
          toastShow('success', "✅ Entrepôt créé avec succès");
          this.isSaving = false
          document.getElementById('closeModalWhStore002')?.click();
        }
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalWhStore002'));
      }
    })
  }

  isGetTypePayments(value: string): boolean {
    return this.selectedPayments.some(p => p.value === value);
  }


  saveEditWarehouse() {
    this.isSaving = true
    const data = {
      activeDays: this.workSchedule.filter(d => d.active),
      whStoreValue: this.formWarehouse?.value,
      payments: this.selectedPayments
    }
    this.publicService.putWarehouseStore(this.whToEdit?.id, data).subscribe({
      next: (res: { warehouse: Warehouse }) => {
        if ('warehouse' in res) {
          this.warehouses = this.warehouses.filter((warehouse: Warehouse) => warehouse.id !== this.whToEdit?.id);
          this.warehouses?.unshift(res?.warehouse)
          this.isSaving = false
          toastShow("success", "✅ Entrepôt mis à jour avec succès")
          document.getElementById('closeModalWhStore002')?.click()
        }
      },
      error: (err) => {
        this.errors = err?.error?.errors || [];
        this.isSaving = false
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalWhStore002'));
      }
    })
  }

  selectPayment(item: { name: string; value: string }, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      // Syntaxe plus moderne pour ajouter
      if (!this.selectedPayments.some(p => p.value === item.value)) {
        this.selectedPayments = [...this.selectedPayments, item];
      }
    } else {
      this.selectedPayments = this.selectedPayments.filter(p => p.value !== item.value);
    }
  }

  deleteWarehouse(idWh: number) {
    Swal.fire({
      title: "Suppression",
      text: "Êtes-vous sûr(e) de vouloir supprimer cet entrepôt?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicService.deleteWarehouseStore(idWh).subscribe({
          next: () => {
            this.warehouses = this.warehouses.filter((whouse: any) => whouse?.id !== idWh);
            this.errors = []
            toastShow('success', "✅ Entrepôt supprimée avec succès");
          },
          error: (err) => {
            this.errors = err?.error?.errors || [];
            showError(err, err.status, this.errors, err.error, document.getElementById('closeModalWhStore002'));
          }
        });
      }
    });
  }

  fillModalWh(item: Warehouse) {
    this.selectedPayments = []
    this.getTypePayments = []
    this.whToEdit = item
    this.titleModal = "Modifier un entrepôt"
    this.errors = []
    this.editWh = true
    this.formWarehouse.patchValue({
      name: item?.nameWh || '',
      typeWh: item?.typeWh || 0,
      phoneWh: item?.phoneWh || '',
      localisation: item?.localisation || '',
      invoiceIndice: item?.invoiceIndice || '',
      noteCreditIndice: item?.noteCreditIndice || '',
      transferIndice: item?.transferIndice || '',
      lotIndice: item?.lotIndice || '',
      collectTva: item?.collectTva,
      editSoldPrice: item?.editSoldPrice,
      makeGift: item?.makeGift,
      getCreditNote: item?.getCreditNote,
      rateTva: item?.rateTva,
      configDaysWork: item?.configDaysWork,
      swapping: item?.swapping
    })
    this.publicService.getPayment(item?.id).subscribe({
      next: (res: { result: any[], serialOpenHour: OpenHour[] }) => {
        this.getTypePayments = res?.result
        // Create a lookup map for table1(day → TableItem)
        const tableMap = new Map(res?.serialOpenHour.map((item: any) => [item.day, item]));

        // Update workSchedule
        this.workSchedule = this.workSchedule.map(dayObj => {
          const match = tableMap.get(dayObj.day);

          if (match) {
            // Day exists in table1 → update start/end times from table1
            return {
              ...dayObj,
              active: match.active, // or keep dayObj.active if you prefer
              startTime: match.start_time?.slice(0, 5), // convert '08:00:00' → '08:00'
              endTime: match.end_time?.slice(0, 5),
            };
          } else {
            // Day not found → deactivate
            return {
              ...dayObj,
              active: false,
            };
          }
        });
        this.selectedPayments = this.typePayments.filter((item: any) => this.getTypePayments[item.value]);
      }
    })

  }

  filterWarehouseTypes(): void {
    const yesWhSecond = this.the_setting?.yesWhSecond;
    this.filteredTypesWarehouses = yesWhSecond ? this.typesWarehouse : this.typesWarehouse.filter(type => type.value !== 'Secondaire');
  }

  returnName(value: string) {
    return this.filteredTypesWarehouses.find((typeWh) => typeWh?.value === value)?.name
  }

  trackByWhId(item: any): number {
    return item?.id;
  }

  onTvaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Replace comma with dot
    if (value.includes(',')) {
      value = value.replace(',', '.');
      this.formWarehouse.get('rateTva')?.setValue(value, { emitEvent: false });
    }
  }


}

