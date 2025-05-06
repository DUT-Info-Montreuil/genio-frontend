import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgIf} from '@angular/common';

interface LoginResponse {
  message: string;
}

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {
  email = '';
  password = '';
  showPassword = false;
  loginError = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.loginError = '';

    const body = new URLSearchParams();
    body.set('email', this.email.trim());
    body.set('password', this.password);

    this.http.post('http://localhost:8080/auth/login', body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      withCredentials: true
    }).subscribe({
      next: () => {
        this.http.get<any>('http://localhost:8080/api/utilisateurs/me', {
          withCredentials: true
        }).subscribe({
          next: user => {
            this.authService.setUser(user);
            this.router.navigate(['/consulter-modeles']);
          },
          error: () => this.loginError = "Erreur lors de la récupération du profil"
        });
      },
      error: (err) => {
        this.loginError = err.error?.message || "Identifiants invalides";
      }
    });
  }
}
