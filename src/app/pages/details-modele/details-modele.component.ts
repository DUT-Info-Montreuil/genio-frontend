import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details-modele',
  imports: [],
  templateUrl: './details-modele.component.html',
  standalone: true,
  styleUrl: './details-modele.component.css'
})
export class DetailsModeleComponent {
  id: string = '';

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id')!;
  }

}
