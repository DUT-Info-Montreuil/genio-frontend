import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterModeleTousComponent } from './consulter-modele-tous.component';

describe('ConsulterModeleTousComponent', () => {
  let component: ConsulterModeleTousComponent;
  let fixture: ComponentFixture<ConsulterModeleTousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsulterModeleTousComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsulterModeleTousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
