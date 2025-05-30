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
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-contact',
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './contact.component.html',
  standalone: true,
  styleUrl: './contact.component.css'
})
export class ContactComponent {

}
