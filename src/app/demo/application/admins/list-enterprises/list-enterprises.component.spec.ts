import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEnterprisesComponent } from './list-enterprises.component';

describe('ListEnterprisesComponent', () => {
  let component: ListEnterprisesComponent;
  let fixture: ComponentFixture<ListEnterprisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListEnterprisesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListEnterprisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
