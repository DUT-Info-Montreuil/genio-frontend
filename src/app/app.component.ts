import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './shared/footer/footer.component';
import {InscriptionComponent} from './pages/inscription/inscription.component';
import {NavbarComponent} from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, InscriptionComponent, NavbarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'genio-frontend';
}
