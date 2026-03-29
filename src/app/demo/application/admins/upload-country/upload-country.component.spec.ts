import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCountryComponent } from './upload-country.component';

describe('UploadCountryComponent', () => {
  let component: UploadCountryComponent;
  let fixture: ComponentFixture<UploadCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadCountryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
