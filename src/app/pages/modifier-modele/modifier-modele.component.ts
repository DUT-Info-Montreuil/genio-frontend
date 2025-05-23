import {ChangeDetectorRef, Component, ElementRef, input, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-modifier-modele',
  templateUrl: './modifier-modele.component.html',
  standalone: true,
  imports: [
    NgClass,
    BreadcrumbComponent,
    RouterLink,
    FormsModule,
    NgIf,
    NgForOf,
    DatePipe,
  ],
  styleUrls: ['./modifier-modele.component.css', '../../../assets/styles/header.css','../../../assets/styles/modal-box.css','../../../assets/styles/auth-shared.css','../../../assets/styles/ tables-common.css']
})
export class ModifierModeleComponent implements OnInit {

  isAnneeValid: boolean = false;
  annee: string = '';
  idModeleActuel: number = 0;
  currentYear = new Date().getFullYear();
  selectedFile: File | null = null;
  message: string = '';
  error: string = '';
  isSubmitting = false;
  showAllVariables = false;
  isNotAModel = false;
  utilisateurs: any[] = [];
  isFileValid: boolean = false;
  allVariablesStatus: { name: string; ok: boolean }[] = [];
  showAnneeErrorModal = false;
  showFileErrorModal: boolean = false;
  showExpectedVariables = false;
  searchText = '';
  searchYear = '';
  advancedSearch = '';
  entriesPerPage = 5;
  currentPage = 1;
  filteredModeles: any[] = [];
  paginatedModeles: any[] = [];
  protected readonly document = document;



  constructor(
    private http: HttpClient,
    protected router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
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

  applyFilters() {
    const text = this.searchText.toLowerCase().trim();
    const year = this.searchYear?.toString().trim();
    const adv = this.advancedSearch.toLowerCase().trim();

    this.filteredModeles = this.modeles.filter(m => {
      const nom = m.nom?.toLowerCase() || '';
      const titre = m.titre?.toLowerCase() || '';
      const annee = m.annee?.toString() || this.extractAnneeFromNom(m.nom);
      const desc = m.description?.toLowerCase() || '';
      const statutTexte = m.statutTexte?.toLowerCase() || '';

      const texteRechercheAvancee = `${titre} ${nom} ${annee} ${desc} ${statutTexte}`;

      return (
        (nom.includes(text) || titre.includes(text)) &&
        (!year || annee === year) &&
        (!adv || texteRechercheAvancee.includes(adv))
      );
    });

    this.currentPage = 1;
    this.updatePaginatedModeles();
  }

  onUpdate(): void {
    if (!this.selectedModel) return;

    const now = new Date(); // ✅ ici en haut

    const updatePayload = {
      titre: this.selectedModel.titre,
      descriptionModification: this.descriptionModification,
      dateDerniereModification: now.toISOString(),
      id: this.selectedModel.id, // 💥 Ajoute ça
      nom: this.selectedModel.nom, // 💥 Ajoute ça
      annee: this.selectedModel.annee, // 💥 Ajoute ça
    };

    this.http.put(`http://localhost:8080/conventionServices/${this.idModeleActuel}`, updatePayload)
      .subscribe({
        next: () => {
          this.selectedModel.dateDerniereModification = now;
          this.message = '✅ Modèle mis à jour avec succès !';
          this.error = '';
          this.isSubmitting = false;
          this.showEditModal = false;

          setTimeout(() => this.message = '', 2000);
        },
        error: (err) => {
          this.error = err.error?.error || '❌ Erreur lors de la mise à jour.';
          this.message = '';
          this.isSubmitting = false;

          setTimeout(() => this.error = '', 3000);
        }
      });

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.http.put(`http://localhost:8080/conventionServices/${this.idModeleActuel}/file`, formData)
        .subscribe();
    }
  }

  descriptionModification: string = '';

  showEditModal = false;

  selectModel(modele: any): void {
    this.selectedModel = modele;
    this.idModeleActuel = modele.id;
    this.annee = modele.annee || this.extractAnneeFromNom(modele.nom);
    this.descriptionModification = modele.descriptionModification || '';
    this.error = '';
    this.message = '';
    this.selectedFile = null;
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
      this.error = '❌ Le fichier doit être au format .docx.';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post('http://localhost:8080/conventionServices/test-generation', formData, { responseType: 'text' })
      .subscribe({
        next: (response: any) => {
          this.selectedFile = file;

          if (typeof response === 'string' && response.includes("Variables détectées")) {
            const variablesDetectees = response
              .replace("Variables détectées :", "")
              .split(",")
              .map(v => v.trim());

            const expected = this.getExpectedVariables();
            const found = variablesDetectees;

            this.allVariablesStatus = expected.map(v => ({
              name: v,
              ok: found.includes(v)
            }));
            this.cdr.detectChanges();

            const missing = this.allVariablesStatus.filter(v => !v.ok);
            this.isFileValid = missing.length === 0;
            this.isNotAModel = false;
            this.error = this.isFileValid ? '' : `Le document est un modèle, mais il manque ${missing.length} variable(s).`;
            this.showFileErrorModal = !this.isFileValid;
            if (variablesDetectees.length === 0) {
              this.isFileValid = false;
              this.isNotAModel = true;
              this.error = '❌ Ce fichier ne semble pas être un modèle de convention (aucun champ détecté).';
              this.showFileErrorModal = true;
              return;
            }

            if (missing.length > 0) {
              this.isFileValid = false;
              this.error = `❌ Le document est un modèle, mais il manque ${missing.length} variable(s) : ${missing.join(', ')}`;
              this.showFileErrorModal = true;
            } else {
              this.isFileValid = true;
              this.error = '';
            }
          } else {
            this.isFileValid = false;
            this.isNotAModel = true;
            this.error = '❌ Le fichier ne semble pas être un modèle de convention.';
            this.showFileErrorModal = true;
          }
        },
        error: (err) => {
          this.selectedFile = file;
          const rawMessage = err?.error || '';
          if (rawMessage.includes('Aucun contenu exploitable')) {
            this.isNotAModel = true;
            this.error = rawMessage;
            this.isFileValid = false;
            this.showFileErrorModal = true;
            return;
          }
          this.isNotAModel = false;

          const formDataRetry = new FormData();
          formDataRetry.append('file', file);

          this.http.post('http://localhost:8080/conventionServices/test-generation', formDataRetry, { responseType: 'text' })
            .subscribe({
              next: (res: any) => {
                if (typeof res === 'string' && res.includes('Variables détectées')) {
                  const variablesDetectees = res
                    .replace("Variables détectées :", "")
                    .split(",")
                    .map(v => v.trim());

                  const missing = this.getExpectedVariables().filter(expected => !variablesDetectees.includes(expected));


                  if (missing.length > 0) {
                    this.isFileValid = false;
                    this.error = `❌ Le document est un modèle mais il n’est pas complet. Il manque ${missing.length} variable(s) : ${missing.join(', ')}.`;
                    this.showFileErrorModal = true;
                  } else {
                    this.isFileValid = true;
                    this.error = '';
                  }

                } else {
                  this.isFileValid = false;
                  this.error = "❌ Format inattendu dans le retour.";
                }

                this.showFileErrorModal = true;
              },
              error: (err2) => {
                this.error = err2?.error || "Erreur inconnue lors de la relecture.";
                this.isFileValid = false;
                this.showFileErrorModal = true;
              }
            });
        }
      });
  }


  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragover');

    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      this.handleFileValidation(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragover');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileValidation(input.files[0]);
    }
  }

  openAnneeErrorModal(): void {
    this.showAnneeErrorModal = true;
  }

  closeAnneeErrorModal(): void {
    this.showAnneeErrorModal = false;
    this.cdr.detectChanges();
  }

  closeFileErrorModal(): void {
    this.showFileErrorModal = false;
    this.cdr.detectChanges(); // <-- force le rafraîchissement Angular
  }

  toggleShowAllVariables(): void {
    this.showAllVariables = !this.showAllVariables;
  }

  modeles: any[] = [];
  selectedModel: any = null;

  ngOnInit(): void {
    this.loadModeles();
  }

  loadModeles(): void {
    this.http.get<any[]>('http://localhost:8080/conventionServices').subscribe({
      next: (data) => {
        this.modeles = data.map(m => ({
          ...m,
          dateDerniereModification: m.dateDerniereModification ? new Date(m.dateDerniereModification) : null
        }));
        this.filteredModeles = [...this.modeles];
        this.applyFilters(); // ← Important aussi
      },
      error: () => {
        this.error = "Erreur lors du chargement des modèles.";
      }
    });
  }


  titreEditable = false;

  enableEditTitre() {
    this.titreEditable = true;
    setTimeout(() => {
      const input = document.getElementById('titre') as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  protected readonly Math = Math;
}
