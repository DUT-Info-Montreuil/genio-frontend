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
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-accueil',
  imports: [RouterLink, CommonModule],
  templateUrl: './accueil.component.html',
  standalone: true,
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {

}
