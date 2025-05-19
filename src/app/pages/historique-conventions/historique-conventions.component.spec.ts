import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueConventionsComponent } from './historique-conventions.component';

describe('HistoriqueConventionsComponent', () => {
  let component: HistoriqueConventionsComponent;
  let fixture: ComponentFixture<HistoriqueConventionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueConventionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueConventionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
