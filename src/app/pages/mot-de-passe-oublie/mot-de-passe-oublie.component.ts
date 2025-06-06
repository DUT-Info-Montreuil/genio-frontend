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
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    RouterLink,
    NgIf
  ],
  templateUrl: './mot-de-passe-oublie.component.html',
  styleUrls: [
    './mot-de-passe-oublie.component.css',
    '../../../assets/styles/auth-shared.css'
  ],
})
export class MotDePasseOublieComponent {
  email = '';
  resetError = '';
  resetSuccess = '';
  isSubmitting = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.resetError = '';
    this.resetSuccess = '';
    this.isSubmitting = true;

    this.http.post(`${environment.apiUrl}/auth/mot-de-passe-oublie`, {
      email: this.email.trim()
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).subscribe({
      next: () => {
        this.resetSuccess = 'Un e-mail de réinitialisation a été envoyé si votre adresse est enregistrée.';
        this.isSubmitting = false;

        setTimeout(() => {
          this.resetSuccess = '';
        }, 2000);
      },
      error: (err) => {
        this.resetError = err.error?.message || 'Erreur lors de la demande.';
        this.isSubmitting = false;

        setTimeout(() => {
          this.resetError = '';
        }, 5000);
      }
    });
  }
}
