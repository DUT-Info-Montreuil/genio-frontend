import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsModeleComponent } from './details-modele.component';

describe('DetailsModeleComponent', () => {
  let component: DetailsModeleComponent;
  let fixture: ComponentFixture<DetailsModeleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsModeleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsModeleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
