import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css', '../../../assets/styles/auth-shared.css'],
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

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  onSubmit() {
    this.message = '';
    this.error = '';

    if (!this.nouveauMotDePasse.match(this.passwordRegex)) {
      this.error = 'Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial.';
      return;
    }

    if (this.nouveauMotDePasse !== this.confirmMotDePasse) {
      this.error = "Les mots de passe ne correspondent pas.";
      return;
    }

    this.isSubmitting = true;

    this.http.post('http://localhost:8080/auth/reset-password', {
      token: this.token,
      nouveauMotDePasse: this.nouveauMotDePasse
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/connexion'], { queryParams: { resetSuccess: 'true' } });
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la réinitialisation.';
        this.isSubmitting = false;
      }
    });
  }
}
