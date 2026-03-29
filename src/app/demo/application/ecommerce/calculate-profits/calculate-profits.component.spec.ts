import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateProfitsComponent } from './calculate-profits.component';

describe('CalculateProfitsComponent', () => {
  let component: CalculateProfitsComponent;
  let fixture: ComponentFixture<CalculateProfitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateProfitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculateProfitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
