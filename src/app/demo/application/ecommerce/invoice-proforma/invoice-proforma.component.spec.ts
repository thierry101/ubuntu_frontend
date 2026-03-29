import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceProformaComponent } from './invoice-proforma.component';

describe('InvoiceProformaComponent', () => {
  let component: InvoiceProformaComponent;
  let fixture: ComponentFixture<InvoiceProformaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceProformaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvoiceProformaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
