import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesInStockComponent } from './articles-in-stock.component';

describe('ArticlesInStockComponent', () => {
  let component: ArticlesInStockComponent;
  let fixture: ComponentFixture<ArticlesInStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesInStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArticlesInStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
