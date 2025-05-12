import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterLink, NgIf]
})
export class NavbarComponent {
  currentRoute: string = '';

  constructor(private router: Router) {
    router.events.subscribe(() => {
      this.currentRoute = this.router.url;
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
}
