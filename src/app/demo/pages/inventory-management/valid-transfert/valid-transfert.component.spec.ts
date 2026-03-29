import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidTransfertComponent } from './valid-transfert.component';

describe('ValidTransfertComponent', () => {
  let component: ValidTransfertComponent;
  let fixture: ComponentFixture<ValidTransfertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidTransfertComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidTransfertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
