import {ChangeDetectorRef, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {JsonPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-ajouter-modele',
  imports: [
    FormsModule,
    NgClass,
    NgIf,
    JsonPipe,
    NgForOf
  ],
  templateUrl: './ajouter-modele.component.html',
  standalone: true,
  styleUrls: ['./ajouter-modele.component.css','../../../assets/styles/modal-box.css']
})
export class AjouterModeleComponent {

  isAnneeValid: boolean = false;
  annee: string = '';
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
  protected readonly document = document;

  constructor(
    private http: HttpClient,
    protected router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

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
    formData.append('titre', this.titre);
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

  openFileErrorModal(): void {
    this.showFileErrorModal = true;
  }

  resetForm(): void {
    this.selectedFile = null;
    this.annee = '';
    this.isSubmitting = false;
    this.showExpectedVariables = false;
    this.isAnneeValid = false;
    this.isFileValid = false;
    this.titre = '';
    this.titreEditable = false;
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

            if (missing.length === 0) {
              this.isFileValid = true;
              this.error = '';
              if (this.annee) {
                this.titre = `Convention ${this.annee}`;
              }
            } else {
              this.isFileValid = false;
              this.error = `Certaines informations sont manquantes. Voici les détails ci-dessous.`;
              this.showFileErrorModal = true;
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

  enableEditTitre(): void {
    if (!this.isFileValid) return; // 🔒 sécurité supplémentaire
    this.titreEditable = true;
    const input = document.getElementById('titre') as HTMLInputElement;
    if (input) {
      input.removeAttribute('readonly');
      input.focus();
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

  titre: string = '';
  titreEditable = false;

  hasMissingVariables(): boolean {
    return this.allVariablesStatus.some(v => !v.ok);
  }

  get missingVariables() {
    return this.allVariablesStatus.filter(v => !v.ok);
  }

  get sortedVariables() {
    return this.allVariablesStatus.slice().sort((a, b) => {
      if (a.ok === b.ok) return 0;
      return a.ok ? 1 : -1; // ko d'abord
    });
  }
}
