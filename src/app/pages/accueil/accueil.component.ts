import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [
    RouterLink
  ],
  templateUrl: './accueil.component.html',
  standalone: true,
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

}
