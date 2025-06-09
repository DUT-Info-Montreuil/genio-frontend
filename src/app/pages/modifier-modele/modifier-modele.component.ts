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

import {ChangeDetectorRef, Component, ElementRef, input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-modifier-modele',
  templateUrl: './modifier-modele.component.html',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
  ],
  styleUrls: ['./modifier-modele.component.css', '../../../assets/styles/header.css','../../../assets/styles/modal-box.css','../../../assets/styles/auth-shared.css','../../../assets/styles/ tables-common.css']
})
export class ModifierModeleComponent implements OnInit {
  showValidationModal = false; // pour afficher ou non la modale secondaire
  showAllVariables = false;    // pour basculer entre variables manquantes et toutes
  isAnneeValid: boolean = false;
  annee: string = '';
  idModeleActuel: number = 0;
  selectedFile: File | null = null;
  message: string = '';
  error: string = '';
  isSubmitting = false;
  isNotAModel = false;
  utilisateurs: any[] = [];
  isFileValid: boolean = false;
  allVariablesStatus: { name: string; ok: boolean }[] = [];
  showFileErrorModal: boolean = false;
  searchText = '';
  searchYear = '';
  advancedSearch = '';
  entriesPerPage = 5;
  currentPage = 1;
  filteredModeles: any[] = [];
  paginatedModeles: any[] = [];
  protected readonly document = document;
  modeles: any[] = [];
  selectedModel: any = null;
  descriptionModification: string = '';
  nomFichierTentatif: string | null = null;

  titreEditable = false;
  showEditModal = false;
  protected readonly Math = Math;



  constructor(
    private http: HttpClient,
    protected router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  @ViewChild('tableStart') tableStart!: ElementRef;

  updatePaginatedModeles() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    this.paginatedModeles = this.filteredModeles.slice(start, end);
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

  getYears(): string[] {
    const allYears = this.modeles.map(m => m.annee || this.extractAnneeFromNom(m.nom));
    return [...new Set(allYears)].filter(Boolean).sort();
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

  get totalPages(): number {
    const total = Math.ceil(this.filteredModeles.length / this.entriesPerPage);
    return total;
  }

  toggleShowAllVariables(): void {
    this.showAllVariables = !this.showAllVariables;
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

  setEntriesPerPage(value: number) {
    this.entriesPerPage = +value;
    this.currentPage = 1;
    this.updatePaginatedModeles();
    console.log(`Changement à ${this.entriesPerPage} entrées par page`);
  }

  normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  applyFilters() {
    const text = this.normalize(this.searchText);
    const year = this.searchYear?.trim();
    const adv = this.normalize(this.advancedSearch);

    const wordRegex = new RegExp(`\\b${text}`, 'i');

    this.filteredModeles = this.modeles.filter(m => {
      const titre = this.normalize(m.titre || '');
      const annee = m.annee?.toString() || '';
      const desc = this.normalize(m.description || '');
      const statutTexte = this.normalize(m.statutTexte || '');

      const texteRechercheAvancee = `${annee} ${desc} ${statutTexte}`;

      return (
        wordRegex.test(titre) &&
        (!year || annee === year) &&
        (!adv || texteRechercheAvancee.includes(adv))
      );
    });

    this.currentPage = 1;
    this.updatePaginatedModeles();
  }

  onUpdate(): void {
    if (!this.selectedModel) return;

    this.isSubmitting = true;
    this.message = '';
    this.error = '';

    const now = new Date();

    const updateModel = () => {
      const updatePayload = {
        titre: this.selectedModel.titre,
        descriptionModification: this.descriptionModification,
        dateDerniereModification: now.toISOString(),
        id: this.selectedModel.id,
        nom: this.selectedModel.nom,
        annee: this.selectedModel.annee,
      };

      this.http.put(`${environment.apiUrl}/conventionServices/${this.idModeleActuel}`, updatePayload)
        .subscribe({
          next: () => {
            this.selectedModel.dateDerniereModification = now;
            this.message = '✅ Modèle mis à jour avec succès.';
            this.error = '';
            this.showEditModal = false;
            this.isSubmitting = false;
            setTimeout(() => this.message = '', 5000);
          },
          error: (err) => {
            this.error = err?.error?.error || 'Erreur lors de la mise à jour.';
            this.message = '';
            this.isSubmitting = false;
            setTimeout(() => this.error = '', 4000);
          }
        });
    };

    if (this.selectedFile) {
      if (!this.isFileValid) {
        this.error = "  Le fichier n’est pas un modèle valide.";
        this.isSubmitting = false;
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.http.put(`${environment.apiUrl}/conventionServices/${this.idModeleActuel}/file`, formData)
        .subscribe({
          next: () => {
            this.message = 'Fichier remplacé avec succès.';
            this.error = '';
            this.nomFichierTentatif = null;
            setTimeout(() => this.message = '', 5000);
            updateModel();
          },
          error: (err) => {
            this.error = err?.error?.error || "Le fichier n’a pas été accepté par le backend.";
            this.message = '';
            this.selectedFile = null;
            this.nomFichierTentatif = null;
            this.isSubmitting = false;
            setTimeout(() => this.error = '', 5000);
          }
        });
    } else {
      updateModel();
    }
  }



  selectModel(modele: any): void {
    this.selectedFile = null;
    this.nomFichierTentatif = null;
    this.allVariablesStatus = [];
    this.isFileValid = false;
    this.isNotAModel = false;
    this.showFileErrorModal = false;
    this.error = '';
    this.message = '';

    this.selectedModel = modele;
    this.idModeleActuel = modele.id;
    this.annee = modele.annee;
    this.descriptionModification = modele.descriptionModification || '';
    this.isAnneeValid = true;

    if (!this.selectedModel.titre || this.selectedModel.titre.trim() === '') {
      this.selectedModel.titre = `modeleConvention_${this.annee}`;
    }

    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
  }

  extractAnneeFromNom(nom: string): string {
    const match = nom?.match(/_(\d{4})/);
    return match ? match[1] : '????';
  }

  removeFile(): void {
    this.selectedFile = null;
    this.isFileValid = false;
    this.error = '';
    this.showFileErrorModal = false;
  }

  getExpectedVariables(): string[] {
    return [
      'annee', 'NOM_ORGANISME', 'ADR_ORGANISME', 'NOM_REPRESENTANT_ORG',
      'QUAL_REPRESENTANT_ORG', 'NOM_DU_SERVICE', 'TEL_ORGANISME', 'MEL_ORGANISME',
      'LIEU_DU_STAGE', 'NOM_ETUDIANT1', 'PRENOM_ETUDIANT', 'SEXE_ETUDIANT',
      'DATE_NAIS_ETUDIANT', 'ADR_ETUDIANT', 'TEL_ETUDIANT', 'MEL_ETUDIANT',
      'SUJET_DU_STAGE', 'DATE_DEBUT_STAGE', 'DATE_FIN_STAGE', 'STA_DUREE',
      '_STA_JOURS_TOT', '_STA_HEURES_TOT', 'TUT_IUT', 'TUT_IUT_MEL',
      'PRENOM_ENCADRANT', 'NOM_ENCADRANT', 'FONCTION_ENCADRANT',
      'TEL_ENCADRANT', 'MEL_ENCADRANT', 'NOM_CPAM', 'Stage_Professionnel', 'STA_REMU_HOR'
    ];
  }



  handleFileValidation(file: File): void {
    if (!file.name.endsWith('.docx')) {
      this.removeFile();
      this.error = 'Le fichier doit être au format .docx.';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post(`${environment.apiUrl}/conventionServices/test-generation`, formData, { responseType: 'text' })
      .subscribe({
        next: (response: any) => {
          this.selectedFile = file;
          this.nomFichierTentatif = file.name;

          if (typeof response === 'string' && response.includes("Variables détectées")) {
            const variablesDetectees = response
              .replace("Variables détectées :", "")
              .split(",")
              .map(v => v.trim());

            const expected = this.getExpectedVariables();
            this.allVariablesStatus = expected.map(v => ({
              name: v,
              ok: variablesDetectees.includes(v)
            }));

            const missing = this.allVariablesStatus.filter(v => !v.ok);
            this.cdr.detectChanges();

            if (variablesDetectees.length === 0) {
              this.isFileValid = false;
              this.isNotAModel = true;
              this.error = 'Ce fichier ne semble pas être un modèle de convention (aucune variable détectée).';
              this.showValidationModal = false; // ✅ pas de modale
            } else if (missing.length > 0) {
              this.isFileValid = false;
              this.isNotAModel = false;
              this.error = `Le document est un modèle, mais il manque ${missing.length} variable(s).`;
              this.showValidationModal = true; // ✅ modale secondaire
            } else {
              this.isFileValid = true;
              this.isNotAModel = false;
              this.error = '';
              this.showValidationModal = false;
            }
          } else {
            this.isFileValid = false;
            this.isNotAModel = true;
            this.error = 'Le fichier n’est pas un modèle de convention reconnu.';
            this.showValidationModal = false; // ✅ pas de modale
          }
        },

        error: (err) => {
          this.selectedFile = null;
          this.isFileValid = false;

          const raw = err?.error;
          if (raw && typeof raw === 'string') {
            if (raw.includes("Aucun contenu exploitable")) {
              this.error = "Aucun contenu exploitable dans le document.";
              this.showValidationModal = false; // ✅ pas de modale
            } else {
              this.error = `Erreur : ${raw}`;
              this.showValidationModal = true;
            }
          } else {
            this.error = 'Une erreur est survenue lors de la validation du fichier.';
            this.showValidationModal = true;
          }
        }
      });
  }

  getMissingVariablesCount(): number {
    return this.allVariablesStatus.filter(variable => !variable.ok).length;
  }

  getValidVariablesCount(): number {
    return this.allVariablesStatus.filter(variable => variable.ok).length;
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.nomFichierTentatif = file.name;

      this.handleFileValidation(file); // ✔ Appelle la vraie fonction qui fait l’analyse
    }
  }




  ngOnInit(): void {
    this.loadModeles();
  }

  loadModeles(): void {
    this.http.get<any[]>(`${environment.apiUrl}/conventionServices`).subscribe({
      next: (data) => {
        this.modeles = data.map(m => ({
          ...m,
          dateDerniereModification: m.dateDerniereModification ? new Date(m.dateDerniereModification) : null
        }));
        this.filteredModeles = [...this.modeles];
        this.applyFilters();
      },
      error: () => {
        this.error = "Erreur lors du chargement des modèles.";
        setTimeout(() => {
          this.error = '';
        }, 5000);
      }

    });
  }

  hasMissingVariables(): boolean {
    return this.allVariablesStatus.some(v => !v.ok);
  }


  enableEditTitre() {
    this.titreEditable = true;
    setTimeout(() => {
      const input = document.getElementById('titre') as HTMLInputElement;
      input?.focus();
    }, 0);
  }


  protected readonly length = length;
}
