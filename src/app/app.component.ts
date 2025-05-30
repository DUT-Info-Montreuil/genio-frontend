/**
 *  GenioService Frontend
 *  ---------------------
 *  Copyright (c) 2025
 *  Elsa HADJADJ <elsa.simha.hadjadj@gmail.com>
 *
 *  Licence sous Creative Commons CC-BY-NC-SA 4.0.
 *  Vous pouvez consulter la licence ici :
 *  https://creativecommons.org/licenses/by-nc-sa/4.0/
 *
 *  Dépôt GitHub (Frontend) :
 *  https://github.com/DUT-Info-Montreuil/genio-frontend
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './shared/footer/footer.component';
import {NavbarComponent} from './shared/navbar/navbar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent,NavbarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'genio-frontend';
}
