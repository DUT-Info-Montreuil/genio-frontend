import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {AuthService} from '../../services/auth.service';


interface LoginResponse {
  message: string;
}

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {
  username = '';
  password = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    const body = new URLSearchParams();
    body.set('username', this.username.trim());
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
          error: () => alert("Erreur de profil")
        });
      },
      error: (err) => {
        alert(err.error?.message || "Erreur inconnue");
      }
    });
  }
}
