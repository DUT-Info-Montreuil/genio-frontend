import { Component } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf, NgClass],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css','../../../assets/styles/auth-shared.css'],
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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['resetSuccess'] === 'true') {
        this.successMessage = 'Votre mot de passe a été réinitialisé. Veuillez vous reconnecter.';
        if (params['email']) {
          this.email = params['email'];
        }
        setTimeout(() => this.successMessage = '', 5000);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.loginError = '';
    this.isSubmitting = true;

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
            this.isSubmitting = false;
            this.router.navigate(['/consulter-modeles']);
          },
          error: () => {
            this.loginError = "Erreur lors de la récupération du profil";
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        this.loginError = err.error?.message || "Identifiants invalides";
        this.isSubmitting = false;
      }
    });
  }
}
