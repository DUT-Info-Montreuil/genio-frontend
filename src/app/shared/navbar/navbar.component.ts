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
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    NgIf
  ]
})
export class NavbarComponent {
  navbarOpen = false;
  currentRoute = '';

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url.split('?')[0];
      this.navbarOpen = false;
    });
  }

  isAccueilOrPubliquePage(): boolean {
    return [
      '/',
      '/inscription',
      '/connexion',
      '/a-propos',
      '/contact',
      '/mentions-legales',
      '/donnees-personnelles',
      '/plan-du-site',
      '/reset-password',
      '/mot-de-passe-oublie'
    ].includes(this.currentRoute);
  }

  toggleNavbar(): void {
    this.navbarOpen = !this.navbarOpen;
  }
}
