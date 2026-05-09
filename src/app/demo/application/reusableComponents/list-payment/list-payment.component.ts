/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-list-payment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './list-payment.component.html',
  styleUrl: './list-payment.component.scss'
})
export class ListPaymentComponent {

  @Output() paymentSelected = new EventEmitter<string>();

  paymentMethods = [
    { key: 'manuel', img: 'manuel.jpg', label: 'Manuel' },
    { key: 'mobile', img: 'mobile.jpeg', label: 'Mobile Money' }
  ];

  onPaymentChange(method: string) {
    this.paymentSelected.emit(method);
  }

}
