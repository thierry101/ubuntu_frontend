import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsSelectedComponent } from './columns-selected.component';

describe('ColumnsSelectedComponent', () => {
  let component: ColumnsSelectedComponent;
  let fixture: ComponentFixture<ColumnsSelectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsSelectedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColumnsSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
