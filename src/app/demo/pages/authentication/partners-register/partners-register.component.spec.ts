import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnersRegisterComponent } from './partners-register.component';

describe('PartnersRegisterComponent', () => {
  let component: PartnersRegisterComponent;
  let fixture: ComponentFixture<PartnersRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnersRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartnersRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
