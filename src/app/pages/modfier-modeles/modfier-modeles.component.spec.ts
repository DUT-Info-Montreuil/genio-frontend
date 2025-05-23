import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModfierModelesComponent } from './modfier-modeles.component';

describe('ModfierModelesComponent', () => {
  let component: ModfierModelesComponent;
  let fixture: ComponentFixture<ModfierModelesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModfierModelesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModfierModelesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
