import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consulter-modele-tous',
  standalone: true,
  templateUrl: './consulter-modele-tous.component.html',
  styleUrl: './consulter-modele-tous.component.css',
  imports: [NgIf, NgClass, NgFor, RouterLink, FormsModule]
})
export class ConsulterModeleTousComponent {
  modeles: any[] = [];
  selectedModel: any = null;
  showModal = false;
  role: string = '';
  entriesPerPage = 10;
  currentPage = 1;

  constructor(
    public authService: AuthService,
    public router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.role = this.authService.getRole();
    this.http.get<any[]>('http://localhost:8080/conventionServices').subscribe({
      next: (data) => {
        this.modeles = data.map(m => {
          const annee = m.annee || this.extractAnneeFromNom(m.nom);
          return {
            ...m,
            annee,
            nomAffiche: this.formatNom(m.nom),
            description: `Document officiel pour les conventions de l’année ${annee}.`,
            utilise: m.utilise ?? false
          };
        });
      },
      error: () => alert("Erreur lors du chargement des modèles.")
    });
  }

  get paginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    return this.modeles.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.modeles.length / this.entriesPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openDetails(modele: any) {
    this.http.get<any>(`http://localhost:8080/conventionServices/${modele.id}`).subscribe({
      next: (data) => {
        const annee = data.annee || this.extractAnneeFromNom(data.nom);
        this.http.get<any>(`http://localhost:8080/conventionServices/${modele.id}/isUsed`).subscribe({
          next: (res) => {
            this.selectedModel = {
              ...data,
              annee,
              nomAffiche: this.formatNom(data.nom),
              description: `Document officiel pour les conventions de l’année ${annee}.`,
              utilise: res.isUsed
            };
            this.showModal = true;
          },
          error: () => {
            this.selectedModel = {
              ...data,
              annee,
              nomAffiche: this.formatNom(data.nom),
              description: `Document officiel pour les conventions de l’année ${annee}.`,
              utilise: false
            };
            this.showModal = true;
          }
        });
      },
      error: () => alert("Impossible de charger les détails du modèle.")
    });
  }

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
