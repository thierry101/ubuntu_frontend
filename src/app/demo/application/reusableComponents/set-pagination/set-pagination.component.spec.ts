import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPaginationComponent } from './set-pagination.component';

describe('SetPaginationComponent', () => {
  let component: SetPaginationComponent;
  let fixture: ComponentFixture<SetPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetPaginationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
