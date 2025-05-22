import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerer-modeles',
  templateUrl: './gerer-modeles.component.html',
  standalone: true,
  imports: [
    NgClass,
    BreadcrumbComponent,
    RouterLink,
    FormsModule,
    NgIf,
    NgForOf,
    RouterLinkActive
  ],
  styleUrls: ['./gerer-modeles.component.css', '../../../assets/styles/header.css','../../../assets/styles/modal-box.css']
})
export class GererModelesComponent implements OnInit {
  selectedFile: File | null = null;
  annee: string = '';
  message: string = '';
  error: string = '';
  isSubmitting = false;
  showExpectedVariables = false;
  missingVariables: string[] = [];
  showAllVariables = false;
  isNotAModel = false;

  utilisateurs: any[] = [];
  notifMessageVisible = false;

  isExploitant = false;
  isGestionnaire = false;
  isConsultant = false;

  isAnneeValid: boolean = false;
  isFileValid: boolean = false;
  currentYear = new Date().getFullYear();

  constructor(
    private http: HttpClient,
    protected router: Router,
    private authService: AuthService,
   private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isExploitant = this.authService.isExploitant();
    this.isGestionnaire = this.authService.isGestionnaire();
    this.isConsultant = this.authService.isConsultant();

    if (this.isGestionnaire) {
      this.http.get<any[]>('/api/utilisateurs/non-actifs')
        .subscribe(data => this.utilisateurs = data);
    }
  }

  afficherMessageNotif(): void {
    if (this.notifMessageVisible) return;
    this.notifMessageVisible = true;
    setTimeout(() => {
      this.notifMessageVisible = false;
    }, 2000);
  }
  validateAnnee(): void {
    const year = +this.annee;
    this.isAnneeValid = /^\d{4}$/.test(this.annee) && year >= 2020 && year <= this.currentYear + 5;

    if (!this.isAnneeValid) {
      if (!/^\d{4}$/.test(this.annee)) {
        this.error = "⚠️ L’année doit contenir 4 chiffres (ex : 2025).";
      } else {
        this.error = `⚠️ L’année doit être comprise entre 2020 et ${this.currentYear + 5}.`;
      }
      this.selectedFile = null;
      this.isFileValid = false;
      return;
    }

    this.http.get<{ exists: boolean }>(`http://localhost:8080/conventionServices/check-nom-exists?annee=${this.annee}`)
      .subscribe(res => {
        if (res.exists) {
          this.error = `⚠️ Un modèle existe déjà pour l’année ${this.annee}.`;
          this.isAnneeValid = false;
          this.selectedFile = null;
          this.isFileValid = false;
        } else {
          this.error = '';
          this.isAnneeValid = true;
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileValidation(input.files[0]);
    }
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

            const missing = this.getExpectedVariables().filter(expected => !variablesDetectees.includes(expected));

            this.missingVariables = missing;
            this.isNotAModel = false;

            if (missing.length > 0) {
              this.isFileValid = false;
              this.error = `❌ Le modèle est bien structuré, mais il manque ${missing.length} variable(s) : ${missing.join(', ')}`;
              this.showFileErrorModal = true;
            } else {
              this.isFileValid = true;
              this.error = '';
            }
          } else {
            this.isFileValid = false;
            this.isNotAModel = true;
            this.missingVariables = [];
            this.error = '❌ Le fichier ne semble pas être un modèle de convention.';
            this.showFileErrorModal = true;
          }
        },
        error: (err) => {
          this.selectedFile = file;
          const rawMessage = err?.error || '';
          if (rawMessage.includes('Aucun contenu exploitable')) {
            this.isNotAModel = true;
            this.missingVariables = [];
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

                  this.missingVariables = missing;

                  if (missing.length > 0) {
                    this.isFileValid = false;
                    this.error = `❌ Le modèle est bien structuré, mais il manque ${missing.length} variable(s).`;
                  } else {
                    this.isFileValid = true;
                    this.error = '';
                  }

                } else {
                  this.missingVariables = [];
                  this.isFileValid = false;
                  this.error = "❌ Format inattendu dans le retour.";
                }

                this.showFileErrorModal = true;
              },
              error: (err2) => {
                this.missingVariables = [];
                this.error = err2?.error || "Erreur inconnue lors de la relecture.";
                this.isFileValid = false;
                this.showFileErrorModal = true;
              }
            });
        }
      });
  }

  chunkArray(array: string[], size: number): string[][] {
    const result: string[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  onSubmit(): void {
    if (!this.isAnneeValid) {
      this.error = 'L’année est invalide.';
      return;
    }

    if (!this.isFileValid || !this.selectedFile) {
      this.openFileErrorModal();
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('annee', this.annee);
    this.isSubmitting = true;

    this.http.post<any>('http://localhost:8080/conventionServices', formData).subscribe({
      next: (res) => {
        this.message = res.message;
        this.error = '';
        this.resetForm();
      },
      error: (err) => {
        const msg = err.error?.error || "Erreur lors de l'ajout du modèle.";
        this.error = msg;
        if (msg.includes("déjà été ajouté")) {
          this.error = "⚠️ Ce fichier a déjà été ajouté.";
        }
        this.message = '';
        this.isSubmitting = false;
        this.showExpectedVariables = false;
      }
    });
  }

  toggleExpectedVariables(): void {
    this.showExpectedVariables = !this.showExpectedVariables;
  }

  resetForm(): void {
    this.selectedFile = null;
    this.annee = '';
    this.isSubmitting = false;
    this.showExpectedVariables = false;
    this.isAnneeValid = false;
    this.isFileValid = false;
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

  ajouter() {

  }

  modifier() {

  }

  supprimer() {

  }

  showFileErrorModal: boolean = false;

  openFileErrorModal(): void {
    this.showFileErrorModal = true;
  }

  closeFileErrorModal(): void {
    this.showFileErrorModal = false;
    this.cdr.detectChanges(); // <-- force le rafraîchissement Angular
  }

  removeFile(): void {
    this.selectedFile = null;
    this.isFileValid = false;
    this.error = '';
    this.showFileErrorModal = false;
  }

  showAnneeErrorModal = false;

  openAnneeErrorModal(): void {
    this.showAnneeErrorModal = true;
  }

  closeAnneeErrorModal(): void {
    this.showAnneeErrorModal = false;
    this.cdr.detectChanges(); // utile pour forcer le refresh si besoin
  }
}
