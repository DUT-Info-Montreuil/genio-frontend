import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-inscription',
  standalone: true,
  templateUrl: './inscription.component.html',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
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

  message = '';
  error = '';

  isSubmitting = false;
  passwordRules: string[] = [];

  constructor(private http: HttpClient) {}

  validatePassword(): void {
    const rules = [];
    if (this.password.length < 12) rules.push('12 caractères minimum');
    if (!/[A-Z]/.test(this.password)) rules.push('Au moins 1 majuscule');
    if (!/\d/.test(this.password)) rules.push('Au moins 1 chiffre');
    if (!/[\W_]/.test(this.password)) rules.push('Au moins 1 caractère spécial');
    this.passwordRules = rules;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {
    this.message = '';
    this.error = '';
    this.isSubmitting = true;

    if (!this.prenom.trim() || !this.nom.trim()) {
      this.error = 'Merci de renseigner prénom et nom.';
      this.isSubmitting = false;
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
      this.error = 'Merci de vérifier votre e-mail.';
      this.isSubmitting = false;
      return;
    }

    this.validatePassword();
    if (this.passwordRules.length > 0) {
      this.error = 'Le mot de passe ne respecte pas les critères.';
      this.isSubmitting = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      this.isSubmitting = false;
      return;
    }

    this.http.post('/api/utilisateurs', {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      motDePasse: this.password
    }).subscribe({
      next: (res: any) => {
        this.message = 'Inscription réussie !';
        this.error = '';
        this.isSubmitting = false;
      },
      error: () => {
        this.error = 'Une erreur est survenue. Veuillez réessayer.';
        this.message = '';
        this.isSubmitting = false;
      }
    });
  }
}
