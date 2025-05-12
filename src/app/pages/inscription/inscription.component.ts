import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css','../../../assets/styles/auth-shared.css']
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

  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

  constructor(private http: HttpClient) {}

  isSubmitting = false;

  onRegister(): void {
    this.message = '';
    this.error = '';
    this.isSubmitting = true;

    if (!this.prenom.trim() || !this.nom.trim()) {
      this.error = 'Le prénom et le nom sont obligatoires.';
      this.isSubmitting = false;
      return;
    }

    if (!this.email.match(this.emailRegex)) {
      this.error = "L'adresse e-mail est invalide.";
      this.isSubmitting = false;
      return;
    }

    if (!this.password.match(this.passwordRegex)) {
      this.error = 'Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial.';
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
        this.message = res.message || 'Utilisateur créé avec succès.';
        this.error = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Une erreur est survenue.';
        this.message = '';
        this.isSubmitting = false;
      }
    });
  }

}
