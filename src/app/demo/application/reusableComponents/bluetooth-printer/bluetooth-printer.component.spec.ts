import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BluetoothPrinterComponent } from './bluetooth-printer.component';

describe('BluetoothPrinterComponent', () => {
  let component: BluetoothPrinterComponent;
  let fixture: ComponentFixture<BluetoothPrinterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BluetoothPrinterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BluetoothPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
