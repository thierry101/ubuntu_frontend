import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputInvoiceComponent } from './input-invoice.component';

describe('InputInvoiceComponent', () => {
  let component: InputInvoiceComponent;
  let fixture: ComponentFixture<InputInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
