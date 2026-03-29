import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrashComponent } from './my-trash.component';

describe('MyTrashComponent', () => {
  let component: MyTrashComponent;
  let fixture: ComponentFixture<MyTrashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTrashComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyTrashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
