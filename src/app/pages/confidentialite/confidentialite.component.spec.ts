import { ComponentFixture, TestBed } from '@angular/core/testing';
import {PolitiqueConfidentialiteComponent} from './confidentialite.component';



describe('DonneesPersonnellesComponent', () => {
  let component: PolitiqueConfidentialiteComponent;
  let fixture: ComponentFixture<PolitiqueConfidentialiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolitiqueConfidentialiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolitiqueConfidentialiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
