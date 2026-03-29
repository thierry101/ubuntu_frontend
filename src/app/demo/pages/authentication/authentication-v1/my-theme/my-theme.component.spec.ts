import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyThemeComponent } from './my-theme.component';

describe('MyThemeComponent', () => {
  let component: MyThemeComponent;
  let fixture: ComponentFixture<MyThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyThemeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
