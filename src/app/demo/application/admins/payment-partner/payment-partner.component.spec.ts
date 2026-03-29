import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPartnerComponent } from './payment-partner.component';

describe('PaymentPartnerComponent', () => {
  let component: PaymentPartnerComponent;
  let fixture: ComponentFixture<PaymentPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPartnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
