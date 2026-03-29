import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreWhComponent } from './store-wh.component';

describe('StoreWhComponent', () => {
  let component: StoreWhComponent;
  let fixture: ComponentFixture<StoreWhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreWhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreWhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
