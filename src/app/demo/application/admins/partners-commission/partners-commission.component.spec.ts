import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersCommissionComponent } from './partners-commission.component';

describe('PartnersCommissionComponent', () => {
  let component: PartnersCommissionComponent;
  let fixture: ComponentFixture<PartnersCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersCommissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartnersCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
