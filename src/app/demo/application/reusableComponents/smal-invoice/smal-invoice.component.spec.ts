import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmalInvoiceComponent } from './smal-invoice.component';

describe('SmalInvoiceComponent', () => {
  let component: SmalInvoiceComponent;
  let fixture: ComponentFixture<SmalInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmalInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SmalInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
