import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPromotionComponent } from './setting-promotion.component';

describe('SettingPromotionComponent', () => {
  let component: SettingPromotionComponent;
  let fixture: ComponentFixture<SettingPromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingPromotionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
