import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatSubcategoriesComponent } from './cat-subcategories.component';

describe('CatSubcategoriesComponent', () => {
  let component: CatSubcategoriesComponent;
  let fixture: ComponentFixture<CatSubcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatSubcategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
