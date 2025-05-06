import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-accueil',
  imports: [
    RouterLink, CommonModule
  ],
  templateUrl: './accueil.component.html',
  standalone: true,
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {

}
