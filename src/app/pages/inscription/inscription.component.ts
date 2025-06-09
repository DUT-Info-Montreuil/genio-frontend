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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, RouterLink],
  styleUrls: ['./inscription.component.css', '../../../assets/styles/auth-shared.css']
})
export class InscriptionComponent {
  prenom = '';
  nom = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  error = '';
  message = '';
  consentement = false;

  passwordRules = [
    { label: '12 caractères', valid: false },
    { label: '1 majuscule', valid: false },
    { label: '1 chiffre', valid: false },
    { label: '1 caractère spécial', valid: false }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword() {
    this.passwordRules = [
      { label: '12 caractères', valid: this.password.length >= 12 },
      { label: '1 majuscule', valid: /[A-Z]/.test(this.password) },
      { label: '1 chiffre', valid: /\d/.test(this.password) },
      { label: '1 caractère spécial', valid: /[\W_]/.test(this.password) }
    ];
  }

  hasInvalidPasswordRule(): boolean {
    return this.passwordRules.some(rule => !rule.valid);
  }

  checkEmailUniqueness() {
    if (!this.checkEmailFormat()) {
      this.error = 'L\'adresse e-mail est invalide.';
      return;
    }

    this.http.get<{ exists: boolean }>(`${environment.apiUrl}/api/utilisateurs/exists?email=${this.email.trim()}`)
      .subscribe({
        next: (res) => {
          if (res.exists) {
            // Message générique sans dire explicitement "existe"
            this.error = 'Cet e-mail est peut-être déjà utilisé. Veuillez en choisir un autre.';
          } else {
            this.error = '';  // Pas d’erreur si ok
          }
        },
        error: () => {
          this.error = 'Erreur lors de la vérification de l\'e-mail.';
        }
      });
  }

  checkEmailFormat(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email.trim());
  }

  onRegister() {
    this.error = '';
    this.message = '';

    if (!this.prenom || !this.nom || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      setTimeout(() => this.error = '', 5000);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      setTimeout(() => this.error = '', 5000);
      return;
    }

    if (this.hasInvalidPasswordRule()) {
      this.error = 'Le mot de passe ne respecte pas les règles de sécurité.';
      setTimeout(() => this.error = '', 5000);
      return;
    }

    if (!this.consentement) {
      this.error = 'Vous devez accepter les conditions pour vous inscrire.';
      setTimeout(() => this.error = '', 5000);
      return;
    }

    if (this.error.includes('déjà utilisé')) {
      // Ne pas continuer l’inscription
      return;
    }


    this.isSubmitting = true;

    const body = {
      prenom: this.prenom.trim(),
      nom: this.nom.trim(),
      email: this.email.trim(),
      motDePasse: this.password
    };

    this.http.post(`${environment.apiUrl}/api/utilisateurs`, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true
    }).subscribe({
      next: () => {
        this.message = 'Inscription réussie ! Redirection...';
        setTimeout(() => this.router.navigate(['/connexion']), 5000);
        setTimeout(() => this.message = '', 5000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de l\'inscription.';
        this.isSubmitting = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }
}
