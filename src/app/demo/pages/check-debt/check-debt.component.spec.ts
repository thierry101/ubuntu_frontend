import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckDebtComponent } from './check-debt.component';

describe('CheckDebtComponent', () => {
  let component: CheckDebtComponent;
  let fixture: ComponentFixture<CheckDebtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckDebtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckDebtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
