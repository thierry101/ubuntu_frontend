import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigInvoiceComponent } from './big-invoice.component';

describe('BigInvoiceComponent', () => {
  let component: BigInvoiceComponent;
  let fixture: ComponentFixture<BigInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BigInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
