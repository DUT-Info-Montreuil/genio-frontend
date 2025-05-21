import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
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
  styleUrls: ['./historique-conventions.component.css','../../../assets/styles/ tables-common.css','../../../assets/styles/modal-box.css','../../../assets/styles/header.css']
})
export class HistoriqueConventionsComponent implements OnInit {
  historique: any[] = [];
  filtered: any[] = [];
  paginatedModeles: any[] = [];
  entriesPerPage = 5;
  currentPage = 1;
  searchNom = '';
  searchPromotion = '';
  searchAnnee = '';

  openedHelp: 'flux' | 'json' | 'docx' | null = null;

  isExploitant = false;
  isGestionnaire = false;
  isConsultant = false;

  @ViewChild('tableStart') tableStart!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;



  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    this.closeHelp();
  }

  ngAfterViewChecked(): void {
    if (this.openedHelp && this.modalContent) {
      this.modalContent.nativeElement.focus();
    }
  }

  constructor(private http: HttpClient, private authService: AuthService, public router: Router) {}

  ngOnInit(): void {
    this.isExploitant = this.authService.isExploitant();
    this.isGestionnaire = this.authService.isGestionnaire();

    this.http.get<any[]>('/api/genio/historique').subscribe((data) => {
      data.forEach(item => {
        if (item.timestamp) item.timestamp = new Date(item.timestamp);
      });

      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.historique = data;
      this.applyFilters();
    });
    if (this.isGestionnaire) {
      this.http.get<any[]>('/api/utilisateurs/non-actifs')
        .subscribe(data => this.utilisateurs = data);
    }
  }

  utilisateurs: any[] = [];
  notifMessageVisible = false;

  afficherMessageNotif() {
    if (this.notifMessageVisible) return;
    this.notifMessageVisible = true;
    setTimeout(() => {
      this.notifMessageVisible = false;
    }, 2000);
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

  updatePaginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    this.paginatedModeles = this.filtered.slice(start, end);
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

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  resetFilters() {
    this.searchNom = '';
    this.searchPromotion = '';
    this.searchAnnee = '';
    this.entriesPerPage = 5
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

    if (etape === 'flux') {
      return isFluxError ? 'KO' : 'OK';
    }

    if (etape === 'json') {
      return isFluxError || isValidationError ? 'KO' : 'OK';
    }

    if (etape === 'docx') {
      return isFluxError || isValidationError || isDocxError ? 'KO' : 'OK';
    }

    return 'OK';
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPage <= 3) pages.push(1, 2, 3);
      else if (this.currentPage >= total - 2) pages.push(total - 2, total - 1, total);
      else pages.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
    }

    return pages;
  }

  openHelp(type: 'flux' | 'json' | 'docx') {
    this.openedHelp = type;
  }

  closeHelp() {
    this.openedHelp = null;
  }
}
