import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererModelesComponent } from './gerer-modeles.component';

describe('GererModelesComponent', () => {
  let component: GererModelesComponent;
  let fixture: ComponentFixture<GererModelesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererModelesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GererModelesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
