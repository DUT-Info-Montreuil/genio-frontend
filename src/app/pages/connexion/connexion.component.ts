import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {FooterComponent} from '../../shared/footer/footer.component';

@Component({
  selector: 'app-connexion',
  imports: [
    RouterLink,
    FooterComponent
  ],
  templateUrl: './connexion.component.html',
  standalone: true,
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {

}
