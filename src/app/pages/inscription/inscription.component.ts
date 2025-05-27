import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';

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
    if (!this.email.trim()) return;
    this.http.get<{ exists: boolean }>(`http://localhost:8080/api/utilisateurs/exists?email=${this.email.trim()}`)
      .subscribe({
        next: (res) => {
          if (res.exists) {
            this.error = 'Cet e-mail est déjà utilisé.';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: () => {
          this.error = 'Erreur lors de la vérification de l\'e-mail.';
          setTimeout(() => this.error = '', 3000);
        }
      });
  }

  onRegister() {
    this.error = '';
    this.message = '';

    if (!this.prenom || !this.nom || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (this.hasInvalidPasswordRule()) {
      this.error = 'Le mot de passe ne respecte pas les règles de sécurité.';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.isSubmitting = true;

    const body = {
      prenom: this.prenom.trim(),
      nom: this.nom.trim(),
      email: this.email.trim(),
      motDePasse: this.password
    };

    this.http.post('http://localhost:8080/api/utilisateurs', body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true
    }).subscribe({
      next: () => {
        this.message = 'Inscription réussie ! Redirection...';
        setTimeout(() => this.router.navigate(['/connexion']), 2000);
        setTimeout(() => this.message = '', 2000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de l\'inscription.';
        this.isSubmitting = false;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
}
