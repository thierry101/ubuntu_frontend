import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidInventoryComponent } from './valid-inventory.component';

describe('ValidInventoryComponent', () => {
  let component: ValidInventoryComponent;
  let fixture: ComponentFixture<ValidInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
