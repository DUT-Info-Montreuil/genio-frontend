import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgIf
  ],
  styleUrls: ['./navbar.component.css']
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
      '/plan-du-site'
    ].includes(this.currentRoute);
  }
}
