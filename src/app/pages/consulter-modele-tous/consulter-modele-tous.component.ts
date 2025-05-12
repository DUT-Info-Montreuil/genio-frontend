// ✅ consulter-modele-tous.component.ts (fichier complet)

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import {DatePipe, NgClass, NgFor, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consulter-modele-tous',
  templateUrl: './consulter-modele-tous.component.html',
  styleUrls: ['./consulter-modele-tous.component.css'],
  standalone: true,
  imports: [NgClass, NgIf, NgFor, FormsModule, RouterLink]
})
export class ConsulterModeleTousComponent implements OnInit {
  modeles: any[] = [];
  filteredModeles: any[] = [];
  selectedModel: any = null;
  showModal = false;

  searchText = '';
  searchYear = '';
  advancedSearch = '';
  entriesPerPage = 5;
  currentPage = 1;

  isGestionnaire = false;
  isExploitant = false;
  isConsultant = false;

  utilisateurs: any[] = [];
  popupVisible = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit() {
    this.isGestionnaire = this.authService.isGestionnaire();
    this.isExploitant = this.authService.isExploitant();
    this.isConsultant = this.authService.isConsultant();

    this.loadModeles();

    if (this.isGestionnaire) {
      this.http.get<any[]>('http://localhost:8080/api/utilisateurs/non-actifs')
        .subscribe(data => this.utilisateurs = data);
    }
  }

  ouvrirPopup() {
    this.popupVisible = !this.popupVisible;
  }

  activer(user: any) {
    this.http.put(`http://localhost:8080/api/utilisateurs/${user.id}/role-activation`, null, {
      params: {
        role: 'CONSULTANT',
        actif: 'true'
      }
    }).subscribe(() => {
      this.utilisateurs = this.utilisateurs.filter(u => u.id !== user.id);
    });
  }

  loadModeles() {
    this.http.get<any[]>('http://localhost:8080/conventionServices').subscribe({
      next: (data) => {
        const mapped = data.map(m => {
          const annee = m.annee || this.extractAnneeFromNom(m.nom);
          return {
            ...m,
            annee,
            nomAffiche: this.formatNom(m.nom),
            description: `Document officiel pour les conventions de l’année ${annee}.`,
            utilise: m.utilise ?? false
          };
        });
        this.modeles = mapped;
        this.filteredModeles = [...mapped];
        this.currentPage = 1;
      },
      error: () => alert("Erreur lors du chargement des modèles.")
    });
  }

  applyFilters() {
    const text = this.searchText.toLowerCase().trim();
    const year = this.searchYear?.toString().trim();
    const adv = this.advancedSearch.toLowerCase().trim();

    this.filteredModeles = this.modeles.filter(m => {
      const nom = m.nom?.toLowerCase() || '';
      const nomAffiche = m.nomAffiche?.toLowerCase() || '';
      const annee = m.annee?.toString() || '';
      const desc = m.description?.toLowerCase() || '';
      const statut = m.utilise ? 'utilisé dans une convention' : 'non encore utilisé';

      return (
        (nom.includes(text) || nomAffiche.includes(text)) &&
        (!year || annee === year) &&
        (!adv || `${nomAffiche} ${annee} ${desc} ${statut}`.includes(adv))
      );
    });

    this.currentPage = 1;
  }

  resetFilters() {
    this.searchText = '';
    this.searchYear = '';
    this.advancedSearch = '';
    this.entriesPerPage = 5;
    this.filteredModeles = [...this.modeles];
    this.currentPage = 1;
  }

  setEntriesPerPage(value: number) {
    this.entriesPerPage = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  get paginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    return this.filteredModeles.slice(start, start + this.entriesPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredModeles.length / this.entriesPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3);
      } else if (this.currentPage >= total - 2) {
        pages.push(total - 2, total - 1, total);
      } else {
        pages.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
      }
    }

    return pages;
  }

  openDetails(modele: any) {
    this.http.get<any>(`http://localhost:8080/conventionServices/${modele.id}`).subscribe({
      next: (data) => {
        const annee = data.annee || this.extractAnneeFromNom(data.nom);
        this.http.get<any>(`http://localhost:8080/conventionServices/${modele.id}/isUsed`).subscribe({
          next: (res) => {
            this.selectedModel = {
              ...data,
              format: 'docx',
              nomAffiche: this.formatNom(data.nom),
              dateCreation: data.dateCreation || 'Non précisée',
              taille: this.getFormattedSize(data.fichierBinaire?.length || 0),
              utilise: res.isUsed
            };
            this.showModal = true;
          },
          error: () => this.showFallbackModel(data)
        });
      },
      error: () => alert("Impossible de charger les détails du modèle.")
    });
  }

  getFormattedSize(bytes: number): string {
    return (bytes / 1024).toFixed(1) + ' Ko';
  }

  showFallbackModel(data: any) {
    const annee = data.annee || this.extractAnneeFromNom(data.nom);
    this.selectedModel = {
      ...data,
      annee,
      nomAffiche: this.formatNom(data.nom),
      description: `Document officiel pour les conventions de l’année ${annee}.`,
      utilise: false
    };
    this.showModal = true;
  }

  expectedVariables: string[] = [
    "annee", "NOM_ORGANISME", "ADR_ORGANISME", "NOM_REPRESENTANT_ORG",
    "QUAL_REPRESENTANT_ORG", "NOM_DU_SERVICE", "TEL_ORGANISME", "MEL_ORGANISME",
    "LIEU_DU_STAGE", "NOM_ETUDIANT1", "PRENOM_ETUDIANT", "SEXE_ETUDIANT",
    "DATE_NAIS_ETUDIANT", "ADR_ETUDIANT", "TEL_ETUDIANT", "MEL_ETUDIANT",
    "SUJET_DU_STAGE", "DATE_DEBUT_STAGE", "DATE_FIN_STAGE", "STA_DUREE",
    "_STA_JOURS_TOT", "_STA_HEURES_TOT", "TUT_IUT", "TUT_IUT_MEL",
    "PRENOM_ENCADRANT", "NOM_ENCADRANT", "FONCTION_ENCADRANT",
    "TEL_ENCADRANT", "MEL_ENCADRANT", "NOM_CPAM", "Stage_Professionnel", "STA_REMU_HOR"
  ];

  closeModal() {
    this.showModal = false;
  }

  extractAnneeFromNom(nom: string): string | null {
    const match = nom?.match(/_(\d{4})/);
    return match ? match[1] : null;
  }

  formatNom(nom: string): string {
    const annee = this.extractAnneeFromNom(nom);
    return annee ? `Convention ${annee}` : 'Convention';
  }
}
