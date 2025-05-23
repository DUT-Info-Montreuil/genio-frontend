import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterModeleComponent } from './ajouter-modele.component';

describe('AjouterModeleComponent', () => {
  let component: AjouterModeleComponent;
  let fixture: ComponentFixture<AjouterModeleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterModeleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjouterModeleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
