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

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private role: string = '';
  private username: string = '';

  constructor() {
    this.role = localStorage.getItem('role') || '';
    this.username = localStorage.getItem('username') || '';
  }
  setUser(user: any): void {
    this.role = user.role;
    this.username = user.username;

    localStorage.setItem('role', user.role);
    localStorage.setItem('username', user.username);
  }
  isGestionnaire(): boolean {
    return this.role === 'GESTIONNAIRE';
  }

  isExploitant(): boolean {
    return this.role === 'EXPLOITANT';
  }

  isConsultant(): boolean {
    return this.role === 'CONSULTANT';
  }

}
