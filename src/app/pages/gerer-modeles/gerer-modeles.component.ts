import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgClass, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { FormsModule } from '@angular/forms';
import {ModifierModeleComponent} from '../modifier-modele/modifier-modele.component';
import {AjouterModeleComponent} from '../ajouter-modele/ajouter-modele.component';
import {SupprimerModeleComponent} from '../supprimer-modele/supprimer-modele.component';

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
    ModifierModeleComponent, AjouterModeleComponent, TitleCasePipe,SupprimerModeleComponent
  ],
  styleUrls: ['./gerer-modeles.component.css', '../../../assets/styles/header.css','../../../assets/styles/modal-box.css']
})
export class GererModelesComponent implements OnInit {
  annee: string = '';
  message: string = '';
  error: string = '';
  isSubmitting = false;

  utilisateurs: any[] = [];
  notifMessageVisible = false;

  isExploitant = false;
  isGestionnaire = false;
  isConsultant = false;

  isAnneeValid: boolean = false;
  isFileValid: boolean = false;
  showAnneeErrorModal = false;
  showFileErrorModal: boolean = false;
  ongletActif: 'ajouter' | 'modifier' | 'archiver' = 'ajouter';

  constructor(
    private http: HttpClient,
    protected router: Router,
    private authService: AuthService,
  ) {}

  @ViewChild('modalBox') modalBox: ElementRef | undefined;

  ngAfterViewChecked() {
    if (this.showAnneeErrorModal || this.showFileErrorModal) {
      this.modalBox?.nativeElement?.focus();
    }
  }
  showInfoModal = false;



  closeInfoModal() {
    this.showInfoModal = false;
  }

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

  openInfoModal() {
    console.log('Ouverture de la modale'); // ← Ajoute ceci pour debug
    this.showInfoModal = true;
  }


}
