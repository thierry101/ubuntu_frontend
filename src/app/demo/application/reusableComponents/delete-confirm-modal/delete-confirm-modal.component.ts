/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrl: './delete-confirm-modal.component.scss'
})
export class DeleteConfirmModalComponent implements AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() confirmMessage = 'Pour confirmer la suppression de cette facture, veuillez taper le mot';
  @Input() wordToType = 'facture';
  @Input() errors: any;

  @Output() deleteConfirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  wordCheck = '';
  private modalElement!: HTMLElement;
  private shownListener!: () => void;

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    this.modalElement = this.el.nativeElement.closest('.modal');

    if (this.modalElement) {
      this.shownListener = () => {
        this.wordCheck = ''; // ✅ reset input each time modal opens
      };
      this.modalElement.addEventListener('shown.bs.modal', this.shownListener);
    }
  }

  ngOnDestroy() {
    if (this.modalElement && this.shownListener) {
      this.modalElement.removeEventListener('shown.bs.modal', this.shownListener);
    }
  }

  deleteStock() {
    if (this.wordCheck === this.wordToType) {
      this.deleteConfirmed.emit();

      // Vérifier s'il n'y a pas d'erreurs après l'émission
      // Cette logique suppose que le parent met à jour la propriété `errors`
      // Vous devrez peut-être adapter cette partie selon votre implémentation
      setTimeout(() => {
        if (!this.hasErrors()) {
          this.closeModal();
        }
      }, 100);
    }
  }

  closeModal() {
    const idModal = document.getElementById('closeModalDelete01');
    idModal?.click();
  }

  // Méthode pour vérifier s'il y a des erreurs
  private hasErrors(): boolean {
    return !!(this.errors?.product || this.errors?.permission);
  }
}