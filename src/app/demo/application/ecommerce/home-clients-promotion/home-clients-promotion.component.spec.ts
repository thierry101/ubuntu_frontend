import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeClientsPromotionComponent } from './home-clients-promotion.component';

describe('HomeClientsPromotionComponent', () => {
  let component: HomeClientsPromotionComponent;
  let fixture: ComponentFixture<HomeClientsPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeClientsPromotionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeClientsPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
