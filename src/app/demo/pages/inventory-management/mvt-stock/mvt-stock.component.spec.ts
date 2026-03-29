import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MvtStockComponent } from './mvt-stock.component';

describe('MvtStockComponent', () => {
  let component: MvtStockComponent;
  let fixture: ComponentFixture<MvtStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MvtStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MvtStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
