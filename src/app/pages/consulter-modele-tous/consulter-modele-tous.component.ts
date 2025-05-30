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

import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import {NgClass, NgFor, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-consulter-modele-tous',
  templateUrl: './consulter-modele-tous.component.html',
  styleUrls: ['./consulter-modele-tous.component.css','../../../assets/styles/ tables-common.css','../../../assets/styles/modal-box.css','../../../assets/styles/header.css'],
  standalone: true,
  imports: [NgClass, NgIf, NgFor, FormsModule, RouterLink, BreadcrumbComponent]
})
export class ConsulterModeleTousComponent implements OnInit {

  protected readonly Math = Math;
  toastMessage = '';
  toastVisible = false;
  isLoading = false;
  modeles: any[] = [];
  filteredModeles: any[] = [];
  selectedModel: any = null;
  showModal = false;

  searchText = '';
  searchYear = '';
  advancedSearch = '';
  entriesPerPage = 5;
  currentPage = 1;
  notifMessageVisible = false;
  isGestionnaire = false;
  isExploitant = false;
  isConsultant = false;

  utilisateurs: any[] = [];
  breadcrumbItems: { label: string, url?: string }[] = [];
  paginatedModeles: any[] = [];
  showInfoModal = false;

  @HostListener('document:keydown', ['$event'])
  handleTabKey(e: KeyboardEvent) {
    if (!this.showModal) return;

    const focusable = Array.from(document.querySelectorAll('.modal-card button, .modal-card [tabindex]'))
      .filter(el => (el as HTMLElement).offsetParent !== null) as HTMLElement[];

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }


  openInfoModal() {
    this.showInfoModal = true;
  }

  closeInfoModal() {
    this.showInfoModal = false;
  }

  @ViewChild('tableStart') tableStart!: ElementRef;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit() {
    this.isGestionnaire = this.authService.isGestionnaire();
    this.isExploitant = this.authService.isExploitant();
    this.isConsultant = this.authService.isConsultant();

    this.setBreadcrumb();
    this.loadModeles();
    window.addEventListener('keydown', this.handleEscape);

    if (this.isGestionnaire) {
      this.http.get<any[]>('http://localhost:8080/api/utilisateurs/non-actifs')
        .subscribe(data => this.utilisateurs = data);
    }
  }

  handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.showModal) this.closeModal();
  };

  setBreadcrumb() {
    this.breadcrumbItems = [
      { label: 'Accueil', url: '/' },
      { label: 'Modèles disponibles' }
    ];
  }

  getVariableRows(cols: number = 3): string[][] {
    const list = this.showAllVariables ? this.expectedVariables : this.previewVariables;
    const rows: string[][] = [];

    for (let i = 0; i < list.length; i += cols) {
      rows.push(list.slice(i, i + cols));
    }
    return rows;
  }


  updatePaginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    this.paginatedModeles = this.filteredModeles.slice(start, end);
  }

  formatTitreParDefaut(nom: string): string {
    const match = nom.match(/_(\d{4})/);
    const annee = match ? match[1] : 'inconnue';
    return `modeleConvention_${annee}`;
  }

  loadModeles() {
    this.http.get<any[]>('http://localhost:8080/conventionServices').subscribe({
      next: async (data) => {
        const mapped = await Promise.all(data.map(async (m) => {
          const annee = m.annee || this.extractAnneeFromNom(m.nom);
          let utilise = false;
          try {
            const res = await this.http.get<{ isUsed: boolean }>(
              `http://localhost:8080/conventionServices/${m.id}/isUsed`
            ).toPromise();
            utilise = res?.isUsed ?? false;
          } catch (e) {
            console.warn(`Erreur pour le modèle ${m.id} :`, e);
          }

          return {
            ...m,
            annee,
            titre: m.titre && m.titre.trim() !== '' ? m.titre : this.formatTitreParDefaut(m.nom),
            nomAffiche: this.formatNom(m.nom),
            description: `Document officiel pour les conventions de l’année ${annee}.`,
            utilise,
            statutTexte: utilise ? 'utilisé dans une convention' : 'non encore utilisé'
          };
        }));

        this.modeles = mapped;
        this.filteredModeles = [...mapped];
        this.applyFilters();
      },
      error: () => alert("Erreur lors du chargement des modèles.")
    });
  }
  normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  applyFilters() {
    const text = this.normalize(this.searchText);
    const year = this.searchYear?.toString().trim();
    const adv = this.normalize(this.advancedSearch);

    const wordRegex = new RegExp(`\\b${text}`, 'i'); // mot commençant par `text`

    this.filteredModeles = this.modeles.filter(m => {
      const titre = this.normalize(m.titre || '');
      const annee = m.annee?.toString() || '';
      const desc = this.normalize(m.description || '');
      const statutTexte = this.normalize(m.statutTexte || '');

      const texteRechercheAvancee = `${annee} ${desc} ${statutTexte}`;

      return (
        wordRegex.test(titre) && // mot commençant par `text`
        (!year || annee === year) &&
        (!adv || texteRechercheAvancee.includes(adv))
      );
    });

    this.currentPage = 1;
    this.updatePaginatedModeles();
  }
  resetFilters() {
    this.searchText = '';
    this.searchYear = '';
    this.advancedSearch = '';
    this.entriesPerPage = 5;
    this.filteredModeles = [...this.modeles];
    this.currentPage = 1;
    this.applyFilters();
  }

  setEntriesPerPage(value: number) {
    this.entriesPerPage = +value;
    this.currentPage = 1;
    this.updatePaginatedModeles();
    console.log(`Changement à ${this.entriesPerPage} entrées par page`);
  }


  get totalPages(): number {
    const total = Math.ceil(this.filteredModeles.length / this.entriesPerPage);
    return total;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedModeles();
      setTimeout(() => {
        this.tableStart?.nativeElement?.focus();
      });
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
    this.selectedModel = {
      ...modele,
      titre: modele.titre?.trim() || this.formatTitreParDefaut(modele.nom),
      format: 'docx',
      dateCreation: modele.dateCreation || 'Non précisée',
      taille: this.getFormattedSize(modele.fichierBinaire?.length || 0),
    };
    this.showModal = true;

    setTimeout(() => {
      const modal = document.querySelector('.modal-card');
      (modal as HTMLElement)?.focus();
    });
  }

  getFormattedSize(bytes: number): string {
    return (bytes / 1024).toFixed(1) + ' Ko';
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
  ].sort();

  showAllVariables = false;

  get previewVariables(): string[] {
    return this.expectedVariables.slice(0, 8);
  }

  toggleVariables() {
    this.showAllVariables = !this.showAllVariables;
  }

  closeModal() {
    this.showModal = false;
    setTimeout(() => (document.querySelector('.view') as HTMLElement)?.focus());
  }

  extractAnneeFromNom(nom: string): string | null {
    const match = nom?.match(/_(\d{4})/);
    return match ? match[1] : null;
  }

  formatNom(nom: string): string {
    const annee = this.extractAnneeFromNom(nom);
    return annee ? `Convention ${annee}` : 'Convention';
  }


  afficherMessageNotif() {
    if (this.notifMessageVisible) return;
    this.notifMessageVisible = true;
    setTimeout(() => {
      this.notifMessageVisible = false;
    }, 2000);
  }

  getYears(): string[] {
    return [...new Set(this.modeles.map(m => m.annee))].filter(Boolean).sort();
  }


}
