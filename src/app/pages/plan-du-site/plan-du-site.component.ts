import { Component } from '@angular/core';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-plan-du-site',
  imports: [
    NgIf,
    RouterLink,
    BreadcrumbComponent
  ],
  templateUrl: './plan-du-site.component.html',
  standalone: true,
  styleUrls: ['./plan-du-site.component.css','../../../assets/styles/header.css','../../../assets/styles/modal-box.css','../../../assets/styles/auth-shared.css']
})
export class PlanDuSiteComponent {
  noAccessModalVisible = false;

// Modale refus d'accès
  showNoAccessModal() {
    this.noAccessModalVisible = true;
  }

  closeNoAccessModal() {
    this.noAccessModalVisible = false;
  }

  modalVisible = false;

  // 💡 Exemples : 'CONSULTANT', 'EXPLOITANT', 'GESTIONNAIRE' ou null
  userRole: string | null = null;

  hasAnyRole(): boolean {
    return !!this.userRole;
  }

  hasRole(allowedRoles: string[]): boolean {
    return this.userRole ? allowedRoles.includes(this.userRole) : false;
  }

  showModal() {
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }
}
