import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandsCatalogComponent } from './commands-catalog.component';

describe('CommandsCatalogComponent', () => {
  let component: CommandsCatalogComponent;
  let fixture: ComponentFixture<CommandsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandsCatalogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommandsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
