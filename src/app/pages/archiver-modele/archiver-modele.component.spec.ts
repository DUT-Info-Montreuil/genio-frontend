import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiverModeleComponent } from './archiver-modele.component';

describe('ArchiverModeleComponent', () => {
  let component: ArchiverModeleComponent;
  let fixture: ComponentFixture<ArchiverModeleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiverModeleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiverModeleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
