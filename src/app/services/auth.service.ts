import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role: string = '';
  private username: string = '';

  setUser(user: any): void {
    this.role = user.role;
    this.username = user.username;
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
}
