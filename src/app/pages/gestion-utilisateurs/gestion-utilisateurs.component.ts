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

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterModule, NgForOf, NgIf, BreadcrumbComponent, NgClass],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css','../../../assets/styles/ tables-common.css','../../../assets/styles/modal-box.css','../../../assets/styles/header.css']
})
export class GestionUtilisateursComponent implements OnInit {
  breadcrumbItems: { label: string; url?: string }[] = [];
  utilisateurs: any[] = [];
  filteredUtilisateurs: any[] = [];

  searchEmail = '';
  selectedRole = '';
  filterActif = '';

  entriesPerPage = 5;
  currentPage = 1;

  editedUser: any = null;
  showEditModal = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const source = params['source'] || 'menu';
      this.updateBreadcrumb(source);
    });

    this.loadUsers();
  }

  showHelpModal = false;

  openHelp() {
    this.showHelpModal = true;
  }

  closeHelp() {
    this.showHelpModal = false;
  }

  resetFilters(): void {
    this.searchEmail = '';
    this.selectedRole = '';
    this.filterActif = '';
    this.entriesPerPage = 5
    this.applyFilters();
  }
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  updateBreadcrumb(source: string) {
    this.breadcrumbItems = [
      { label: 'Accueil', url: '/' },
      ...(source === 'historique'
        ? [{ label: 'Historique', url: '/historique-conventions' }]
        : source === 'consulter'
          ? [{ label: 'Modèles disponibles', url: '/consulter-modeles' }]
          : source === 'gerer'
            ? [{ label: 'Administration des modèles', url: '/gerer-modeles' }]
            : []),
      { label: 'Gérer les utilisateurs' }
    ];
  }

  setEntriesPerPage(value: number) {
    this.entriesPerPage = +value;
    this.currentPage = 1;
    this.updatePaginatedModeles();
  }

  paginatedModeles: any[] = [];
  filtered: any[] = [];

  updatePaginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    this.paginatedModeles = this.filtered.slice(start, end);
  }

  loadUsers(): void {
    this.http.get<any[]>(`${environment.apiUrl}/api/utilisateurs`).subscribe(data => {
      this.utilisateurs = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredUtilisateurs = this.utilisateurs.filter(user => {
      return (!this.searchEmail || user.email.toLowerCase().includes(this.searchEmail.toLowerCase()))
        && (!this.selectedRole || user.role === this.selectedRole)
        && (this.filterActif === '' || user.actif.toString() === this.filterActif);
    });
    this.currentPage = 1;
  }

  get paginatedUtilisateurs(): any[] {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    return this.filteredUtilisateurs.slice(start, start + this.entriesPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUtilisateurs.length / this.entriesPerPage);
  }

  get visiblePages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openEditModal(user: any): void {
    this.editedUser = { ...user };
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
  }

  saveUser(): void {
    this.http.put(`${environment.apiUrl}/api/utilisateurs/${this.editedUser.id}/admin-update`, this.editedUser)
      .subscribe(() => {
        const index = this.utilisateurs.findIndex(u => u.id === this.editedUser.id);
        if (index !== -1) {
          this.utilisateurs[index] = { ...this.editedUser };
        }
        this.closeModal();
        this.applyFilters();
      });
  }

  deleteUser(user: any): void {
    this.http.delete(`${environment.apiUrl}/api/utilisateurs/${user.id}`)
      .subscribe(() => {
        this.utilisateurs = this.utilisateurs.filter(u => u.id !== user.id);
        this.applyFilters();
      });
  }

  userToDelete: any = null;

  openDeleteConfirmation(user: any) {
    this.userToDelete = user;
  }

  confirmDeleteUser() {
    if (this.userToDelete) {
      this.deleteUser(this.userToDelete);
      this.userToDelete = null;
    }
  }
}
