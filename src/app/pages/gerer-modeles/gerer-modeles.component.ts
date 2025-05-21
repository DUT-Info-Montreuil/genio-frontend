import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';
import {FormsModule} from '@angular/forms';

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
    NgForOf
  ],
  styleUrls: ['./gerer-modeles.component.css', '../../../assets/styles/header.css']
})
export class GererModelesComponent implements OnInit {
  selectedFile: File | null = null;
  annee: string = '';
  message: string = '';
  error: string = '';
  isSubmitting = false;
  showExpectedVariables = false;

  utilisateurs: any[] = [];
  notifMessageVisible = false;

  isExploitant = false;
  isGestionnaire = false;
  isConsultant = false;

  constructor(
    private http: HttpClient,
    protected router: Router,
    private authService: AuthService
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

  afficherMessageNotif() {
    if (this.notifMessageVisible) return;
    this.notifMessageVisible = true;
    setTimeout(() => {
      this.notifMessageVisible = false;
    }, 2000);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.message = '';
      this.error = '';
      this.showExpectedVariables = false;
    }
  }

  toggleExpectedVariables(): void {
    this.showExpectedVariables = !this.showExpectedVariables;
  }

  onSubmit(): void {
    if (!this.selectedFile || !this.annee.match(/^\d{4}$/)) {
      this.error = "Veuillez sélectionner un fichier .docx valide et une année à 4 chiffres.";
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
        this.selectedFile = null;
        this.annee = '';
        this.isSubmitting = false;
        this.showExpectedVariables = false;
      },
      error: (err) => {
        const msg = err.error?.error || "Une erreur est survenue lors de l'ajout du modèle.";
        this.error = msg;

        if (msg.includes("déjà été ajouté")) {
          this.error = "⚠️ Ce fichier existe déjà. Vous ne pouvez pas l’ajouter deux fois.";
        }

        this.message = '';
        this.isSubmitting = false;
        this.showExpectedVariables = false;
      }
    });
  }

  ajouter(): void {
    console.log('Ajout déclenché');
  }

  modifier(): void {
    console.log('Modification déclenchée');
  }

  supprimer(): void {
    console.log('Suppression déclenchée');
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
}
