import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingCatalogComponent } from './setting-catalog.component';

describe('SettingCatalogComponent', () => {
  let component: SettingCatalogComponent;
  let fixture: ComponentFixture<SettingCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingCatalogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
