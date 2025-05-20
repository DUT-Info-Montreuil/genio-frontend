import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-historique-conventions',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink, NgClass, BreadcrumbComponent],
  templateUrl: './historique-conventions.component.html',
  styleUrls: ['./historique-conventions.component.css']
})
export class HistoriqueConventionsComponent implements OnInit {
  historique: any[] = [];
  filtered: any[] = [];
  paginatedModeles: any[] = [];
  entriesPerPage = 5;
  currentPage = 1;
  searchText = '';
  searchTextAvancee = '';
  searchNom = '';
  searchPromotion = '';
  searchAnnee = '';

  isExploitant = false;
  isGestionnaire = false;

  @ViewChild('tableStart') tableStart!: ElementRef;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.isExploitant = this.authService.isExploitant();
    this.isGestionnaire = this.authService.isGestionnaire();

    this.http.get<any[]>('/api/genio/historique').subscribe((data) => {
      console.log("Données brutes reçues du backend :");
      console.table(data);

      data.forEach((item, index) => {
        console.log(`⏳ [${index}] timestamp AVANT conversion :`, item.timestamp);

        if (item.timestamp) {
          item.timestamp = new Date(item.timestamp); // Correct now
          console.log(`[${index}] timestamp APRÈS conversion :`, item.timestamp);
        } else {
          console.warn(`Pas de timestamp pour item[${index}]`);
        }
      });

      // Tri par date DESC
      data.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      this.historique = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const nom = this.searchNom.toLowerCase().trim();
    const promo = this.searchPromotion.toLowerCase().trim();
    const annee = this.searchAnnee.trim();

    this.filtered = this.historique.filter(item => {
      const etu = item.convention?.etudiant;
      const modele = item.convention?.modele;

      const nomOk = !nom || (etu?.nom?.toLowerCase().includes(nom));
      const promoOk = !promo || (etu?.promotion?.toLowerCase().includes(promo));
      const anneeOk = !annee || (modele?.annee?.toString() === annee);

      return nomOk && promoOk && anneeOk;
    });

    this.currentPage = 1;
    this.updatePaginatedModeles();
  }

  setEntriesPerPage(value: number) {
    this.entriesPerPage = +value;
    this.currentPage = 1;
    this.updatePaginatedModeles();
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  updatePaginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    this.paginatedModeles = this.filtered.slice(start, end);

    console.log("Modèles paginés :", this.paginatedModeles);
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

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.entriesPerPage);
  }

  resetFilters() {
    this.searchNom = '';
    this.searchPromotion = '';
    this.searchAnnee = '';
    this.entriesPerPage = 5;
    this.currentPage = 1;
    this.applyFilters();
  }

  getAnnee(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  }

  getStatusClass(status: string): string {
    if (status === 'SUCCES') return 'status-success';
    if (status === 'ECHEC') return 'status-error';
    return '';
  }

  getEtapeStatus(h: any, etape: 'flux' | 'json' | 'docx'): 'OK' | 'KO' {
    const msg = (h.details || '').toLowerCase();
    const isFluxError =
      msg.includes('format de fichier') ||
      msg.includes('modèle introuvable') ||
      msg.includes('erreur inattendue') ||
      msg.includes('identifiant de modèle manquant') ||
      !h.fluxJsonBinaire;

    const isValidationError = msg.includes('erreurs de validation') || msg.includes("champ");
    const isDocxError = !h.docxBinaire;

    if (etape === 'flux') return isFluxError ? 'KO' : 'OK';
    if (etape === 'json') return isValidationError ? 'KO' : 'OK';
    if (etape === 'docx') return isDocxError ? 'KO' : 'OK';

    return 'OK';
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
}
