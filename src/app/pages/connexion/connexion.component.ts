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
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgIf } from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css', '../../../assets/styles/auth-shared.css'],
})
export class ConnexionComponent {
  email = '';
  password = '';
  showPassword = false;
  loginError = '';
  isSubmitting = false;
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.loginError = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const body = new URLSearchParams();
    body.set('email', this.email.trim());
    body.set('password', this.password);

    this.http.post('http://localhost:8080/auth/login', body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      withCredentials: true
    }).subscribe({
      next: () => {
        this.http.get<any>('http://localhost:8080/api/utilisateurs/me', { withCredentials: true }).subscribe({
          next: (user) => {
            this.authService.setUser({
              role: user.role,
              username: user.email
            });

            this.successMessage = 'Connexion réussie !';
            this.isSubmitting = false;

            setTimeout(() => {
              this.router.navigate(['/consulter-modeles']);
            }, 1500);
          },
          error: () => {
            this.loginError = "Impossible de récupérer les informations utilisateur.";
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.loginError = "Email ou mot de passe incorrect.";
        } else if (err.status === 403) {
          this.loginError = "Votre compte a bien été créé mais est en attente de validation.";
        } else {
          this.loginError = "Erreur lors de la connexion.";
        }

        this.isSubmitting = false;
        setTimeout(() => this.loginError = '', 5000);
      }
    });
  }
}
