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
  styleUrls: ['./inscription.component.css']
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
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  constructor(private http: HttpClient) {}

  onRegister(): void {
    this.message = '';
    this.error = '';

    if (!this.prenom.trim() || !this.nom.trim()) {
      this.error = 'Le prénom et le nom sont obligatoires.';
      return;
    }

    if (!this.email.match(this.emailRegex)) {
      this.error = "L'adresse e-mail est invalide.";
      return;
    }

    if (!this.password.match(this.passwordRegex)) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
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
      },
      error: (err) => {
        this.error = err.error?.error || 'Une erreur est survenue.';
        this.message = '';
      }
    });
  }
}
