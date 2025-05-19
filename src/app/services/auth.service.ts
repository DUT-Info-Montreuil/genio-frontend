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

  getRole(): string {
    return this.role;
  }

  getUsername(): string {
    return this.username;
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

  clearUser(): void {
    this.role = '';
    this.username = '';
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }
}
