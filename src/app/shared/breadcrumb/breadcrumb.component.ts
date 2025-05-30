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

import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  imports: [
    RouterLink,
    NgIf,
    NgForOf
  ],
  templateUrl: './breadcrumb.component.html',
  standalone: true,
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  @Input() items: { label: string, url?: string }[] = [];



}
