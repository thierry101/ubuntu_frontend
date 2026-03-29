import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountClientComponent } from './discount-client.component';

describe('DiscountClientComponent', () => {
  let component: DiscountClientComponent;
  let fixture: ComponentFixture<DiscountClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountClientComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiscountClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
