/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TypeReward } from 'src/app/interfaces/global';
import { ArticleManagementService } from 'src/app/services/article-management.service';
import { PublicService } from 'src/app/services/public.service';
import { BasesReward, formatPriceFr, PeriodsReward, setPagination, showError, SwallModal, toastShow, typeRwsClient } from 'src/app/share/shared';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SetPaginationComponent } from "src/app/demo/application/reusableComponents/set-pagination/set-pagination.component";
import { SpinnersComponent } from 'src/app/demo/application/reusableComponents/spinners/spinners.component';
import Swal from 'sweetalert2';
import { ImagePipe } from 'src/app/pipes/image.pipe';

@Component({
  selector: 'app-setting-promotion',
  standalone: true,
  imports: [SharedModule, SetPaginationComponent, SpinnersComponent, ImagePipe],
  templateUrl: './setting-promotion.component.html',
  styleUrl: './setting-promotion.component.scss'
})
export class SettingPromotionComponent implements OnInit {

  settingReward!: TypeReward
  listRewardedClients!: any
  listOrders!: any
  pagination: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pages: number[] = [];
  paginationOrders: any = {
    currentPage: 1,
    nber_pages: 1,
    previousPage: null,
    nextPage: null,
  };
  pagesOrders: number[] = [];
  isLoading: boolean = false
  isLoadingOrder: boolean = false
  searchTerm: string = ''
  devise: string = '';
  commandDetail!: any
  typeReward: any = 0
  periodReward: any = 0
  typeRewardClient: any = 0
  amtCheck: number = 0
  nberCmd: number = 0
  errors!: any
  basesReward!: any
  periodsReward!: any
  amtReward: number = 0
  percentReward: number = 0
  nameRw: string = ''
  colorRw: string = ''
  logo: string = ''
  allRewards: TypeReward[] = []
  itemEdit!: TypeReward
  editRw: boolean = false
  modalTitle: string = ''
  idsOrders!: any
  flippedCards: boolean[] = [];
  private destroy$ = new Subject<void>();

  constructor(private articleManagementService: ArticleManagementService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.basesReward = BasesReward
    this.periodsReward = PeriodsReward
    this.publicService.enterpriseCustomisation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.logo = res?.logo
          this.devise = res?.devise || '';
        },
        error: (err) => {
          console.error('Error fetching enterprise customisation:', err);
        }
      });
    this.articleManagementService.getSettingPromotion().subscribe({
      next: (res: { result: TypeReward[] }) => {
        this.allRewards = res?.result
      }
    })
  }

  resetForm() {
    this.editRw = false
    this.modalTitle = "Créer une carte de fidelité"
    this.nameRw = ''
    this.colorRw = ''
    this.typeReward = 0
    this.amtCheck = 0
    this.nberCmd = 0
    this.periodReward = 0
    this.typeRewardClient = 0
    this.amtReward = 0
    this.percentReward = 0
    this.errors = []
  }

  fillEdit(item: any) {
    this.editRw = true
    this.itemEdit = item
    this.modalTitle = "Éditer une carte de fidelité"
    this.nameRw = item?.name_card
    this.colorRw = item?.color
    this.typeReward = item?.typeReward || 0
    this.amtCheck = formatPriceFr(item?.amount_reward)
    this.nberCmd = item?.nber_cmdes
    this.periodReward = item?.periodReward
    this.typeRewardClient = item?.rewardTypeClient
    this.amtReward = item?.amount_discount
    this.percentReward = item?.percentage_discount
    this.errors = []
  }

  fetchCLientRewarded(page: number = 1) { //instead of bind I can call arrow function like (page, term) => this.authService.getRegisterByAdmin(page, term)
    this.isLoading = true
    setPagination(this.articleManagementService.getClientRewarded.bind(this.articleManagementService), page, this.searchTerm, (data: any) => {
      this.pagination = data;
      this.listRewardedClients = data?.listItems;
      this.pages = Array.from({ length: data.nber_pages }, (_, i) => i + 1);
      this.isLoading = false
    },
      this.itemEdit?.id, // startDate (optional)
      undefined, // endDate (optional)
      (err: any) => { // ✅ error callback
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));

        // Optional UI state
        this.isLoading = false;
      })
  }

  onPageChange(page: number) {
    this.fetchCLientRewarded(page);
  }


  onCardClick(item: TypeReward, index: number) {
    this.flippedCards[index] = !this.flippedCards[index];
    this.itemEdit = item
    this.typeReward = item?.typeReward || 0
    this.fetchCLientRewarded(1)
  }

  createDiscount(detailsCommand: any) {
    const idClient = detailsCommand?.id_client
    const idOrders = detailsCommand?.orders_ids;
    const idCard = this.itemEdit?.id
    const data = { tableIdOrder: idOrders, idCard: idCard }
    Swal.fire({
      title: "Coupon de récompense",
      text: "Créer le bon de récompense fidélité ?",
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Non!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.articleManagementService.putSetDiscount(idClient, data).subscribe({
          next: (res: any) => {
            this.listRewardedClients = this.listRewardedClients.filter((clientItem: any) => clientItem?.client?.id !== idClient);
            this.errors = []
            SwallModal("success", "Coupon créé", "✅ Coupon créé, un email a été envoyé au client.")
          },
          error: (err) => {
            this.errors = [];
            this.errors = err.error.errors;
            showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
          }
        })
      }
    });
  }


  // ********************************** To set parameter about reward **********************************
  validateReward() {
    const rewardData = {
      nameRw: this.nameRw,
      colorRw: this.colorRw,
      baseReward: this.typeReward,            // amntBuy | nberCmdes
      amntOrCmds: this.typeReward === 'amntBuy' ? this.amtCheck : this.nberCmd,
      period: this.periodReward,              // daily | weekly | monthly | yearly
      rewardTypeClient: this.typeRewardClient,      // amt | percentage
      amtOrPercentage: this.typeRewardClient === 'amt' ? this.amtReward : this.percentReward,
    };
    this.articleManagementService.postSettingPromotion(rewardData).subscribe({
      next: (res: any) => {
        this.allRewards?.push(res?.result)
        this.errors = [];
        this.fetchCLientRewarded(1)
        toastShow('success', "✅ Paramètre enregistré");
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    })
  }

  saveEditReward() {
    const idBtn = document.getElementById('closeModalRw001')
    const rewardData = {
      checker: 'editRw',
      nameRw: this.nameRw,
      colorRw: this.colorRw,
      baseReward: this.typeReward,
      amntOrCmds: this.typeReward === 'amntBuy' ? this.amtCheck : this.nberCmd,
      period: this.periodReward,
      rewardTypeClient: this.typeRewardClient,
      amtOrPercentage: this.typeRewardClient === 'amt' ? this.amtReward : this.percentReward,
    };

    this.articleManagementService.putSettingPromotion(this.itemEdit?.id, rewardData).subscribe({
      next: (res: { result: TypeReward }) => {
        // Remplacer l'ancien reward par le nouveau
        const index = this.allRewards.findIndex(reward => reward.id === this.itemEdit?.id);
        if (index !== -1) {
          this.allRewards[index] = res.result;
          toastShow('success', "✅ Paramètre mis à jour");
          this.errors = []
          idBtn?.click()
        }

        // Si jamais l'ancien n'existe pas (sécurité)
        else {
          this.allRewards.push(res?.result);
        }
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    });
  }

  onToggleState(item: any, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    // Mise à jour immédiate (optimistic UI)
    item.stateReward = checked;
    const data = { checker: 'stateRw', stateRw: checked }

    // Appel API
    this.articleManagementService.putSettingPromotion(item?.id, data).subscribe({
      next: () => {
        toastShow('success', "✅ Paramètre mis à jour");
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModelPromo009'));
      }
    });
  }


  getTypeReward(typeRw: string) {
    return BasesReward.find(item => item?.value === typeRw);
  }

  getPeriod(period: string) {
    return PeriodsReward.find(item => item?.value === period)
  }

  getTypeRw(typeRw: string) {
    return typeRwsClient.find(item => item?.value === typeRw)
  }



  trackByClientRewaredId(index: number, invoice: any): any {
    return invoice?.id;
  }

}
