import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import {DatePipe, NgClass, NgFor, NgIf} from '@angular/common';
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
  breadcrumbItems: { label: string, url?: string }[] = [];
  paginatedModeles: any[] = [];
  integrationOK: boolean = true; // ou false selon ton état
  showInfoModal = false;

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

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleEscape);
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

  ouvrirPopup() {
    this.popupVisible = !this.popupVisible;
  }

  activer(user: any) {
    this.http.put(`http://localhost:8080/api/utilisateurs/${user.id}/role-activation`, null, {
      params: { role: 'CONSULTANT', actif: 'true' }
    }).subscribe(() => {
      this.utilisateurs = this.utilisateurs.filter(u => u.id !== user.id);
    });
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
        this.applyFilters(); // très important ici
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
      const statutTexte = m.statutTexte?.toLowerCase() || '';
      const titre = m.titre?.toLowerCase() || '';

      const texteRechercheAvancee = `${nomAffiche} ${annee} ${desc} ${statutTexte}`;

      return (
        (nom.includes(text) || nomAffiche.includes(text) || titre.includes(text)) &&
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

  confirmDelete(modele: any) {
    console.log('Suppression demandée pour :', modele);
  }

  notifMessageVisible = false;

  afficherMessageNotif() {
    if (this.notifMessageVisible) return;
    this.notifMessageVisible = true;
    setTimeout(() => {
      this.notifMessageVisible = false;
    }, 2000);
  }

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

  protected readonly Math = Math;

  toastMessage = '';
  toastVisible = false;
  isLoading = false;

  afficherToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
      this.toastMessage = '';
    }, 3000);
  }

  getYears(): string[] {
    return [...new Set(this.modeles.map(m => m.annee))].filter(Boolean).sort();
  }


}
