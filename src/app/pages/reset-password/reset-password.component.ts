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
import { NgIf, NgForOf } from '@angular/common';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css', '../../../assets/styles/auth-shared.css']
})
export class ResetPasswordComponent {
  nouveauMotDePasse = '';
  confirmMotDePasse = '';
  token = '';
  message = '';
  error = '';
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;

  passwordRules = [
    { label: '12 caractères', valid: false },
    { label: '1 majuscule', valid: false },
    { label: '1 chiffre', valid: false },
    { label: '1 caractère spécial', valid: false }
  ];

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  validatePassword() {
    this.passwordRules = [
      { label: '12 caractères', valid: this.nouveauMotDePasse.length >= 12 },
      { label: '1 majuscule', valid: /[A-Z]/.test(this.nouveauMotDePasse) },
      { label: '1 chiffre', valid: /\d/.test(this.nouveauMotDePasse) },
      { label: '1 caractère spécial', valid: /[\W_]/.test(this.nouveauMotDePasse) }
    ];
  }

  hasInvalidPasswordRule(): boolean {
    return this.passwordRules.some(rule => !rule.valid);
  }

  onSubmit() {
    this.message = '';
    this.error = '';

    this.validatePassword();

    if (this.hasInvalidPasswordRule()) {
      this.error = 'Le mot de passe ne respecte pas les règles de sécurité.';
      setTimeout(() => this.error = '', 4000);
      return;
    }

    if (this.nouveauMotDePasse !== this.confirmMotDePasse) {
      this.error = "Les mots de passe ne correspondent pas.";
      setTimeout(() => this.error = '', 4000);
      return;
    }

    this.isSubmitting = true;

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      nouveauMotDePasse: this.nouveauMotDePasse
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).subscribe({
      next: () => {
        this.message = 'Mot de passe réinitialisé avec succès ! Redirection...';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/connexion']), 5000);
        setTimeout(() => this.message = '', 5000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la réinitialisation.';
        this.isSubmitting = false;
        setTimeout(() => this.error = '', 4000);
      }
    });
  }
}
