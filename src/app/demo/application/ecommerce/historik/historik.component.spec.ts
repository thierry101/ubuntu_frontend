import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorikComponent } from './historik.component';

describe('HistorikComponent', () => {
  let component: HistorikComponent;
  let fixture: ComponentFixture<HistorikComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorikComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistorikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
