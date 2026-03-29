/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from 'src/app/services/store.service';
import { Enterprise } from 'src/app/interfaces/global';
import { PublicService } from 'src/app/services/public.service';
import { SpinnersComponent } from '../../reusableComponents/spinners/spinners.component';
import { showError } from 'src/app/share/shared';

@Component({
  selector: 'app-detail-client',
  standalone: true,
  imports: [SharedModule, SpinnersComponent],
  templateUrl: './detail-client.component.html',
  styleUrl: './detail-client.component.scss'
})
export class DetailClientComponent implements OnInit {
  searchTerm: string = ''
  id_client: any = 0
  statClient!: any
  devise: string = ""
  isLoading: boolean = false
  errors: any = []

  constructor(private route: ActivatedRoute, private storeService: StoreService, private publicService: PublicService) { }

  ngOnInit(): void {
    this.publicService.getSettingEtpriseForCustomisation().subscribe({
      next: (res: { result: Enterprise }) => {
        this.devise = res?.result?.devise
      }
    })
    this.id_client = this.route.snapshot.paramMap.get('id')!;
    this.isLoading = true;
    this.storeService.getStatClient(this.id_client).subscribe({
      next: (data) => {
        this.statClient = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errors = [];
        this.errors = err.error.errors;
        showError(err, err.status, this.errors, err.error, document.getElementById('closeModalCreate'));
      }
    });
  }



  onSearchChange(term: string) {
    this.searchTerm = term;
    // this.fetchClients(1); // reset to first page on search
  }
}
