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

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgClass,NgIf, TitleCasePipe} from '@angular/common';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { FormsModule } from '@angular/forms';
import {ModifierModeleComponent} from '../modifier-modele/modifier-modele.component';
import {AjouterModeleComponent} from '../ajouter-modele/ajouter-modele.component';
import {ArchiverModeleComponent} from '../archiver-modele/archiver-modele.component';

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
    ModifierModeleComponent, AjouterModeleComponent, TitleCasePipe,ArchiverModeleComponent
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
  showFileErrorModal: boolean = false;
  ongletActif: 'ajouter' | 'modifier' | 'archiver' = 'ajouter';
  breadcrumbItems = [
    { label: 'Accueil', url: '/' },
    { label: 'Gérer', url: '/gerer-modeles' },
    { label: 'Ajouter' }
  ];

  constructor(
    private http: HttpClient,
    protected router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  @ViewChild('modalBox') modalBox: ElementRef | undefined;
  showInfoModal = false;

  closeInfoModal() {
    this.showInfoModal = false;
  }

  ngOnInit(): void {
    this.isExploitant = this.authService.isExploitant();
    this.isGestionnaire = this.authService.isGestionnaire();
    this.isConsultant = this.authService.isConsultant();

    this.breadcrumbItems = [
      { label: 'Accueil', url: '/' },
      { label: 'Gérer', url: '/gerer-modeles' },
      { label: 'Ajouter' }
    ];

    this.route.queryParams.subscribe(params => {
      const onglet = params['onglet'];
      if (onglet === 'ajouter' || onglet === 'modifier' || onglet === 'archiver') {
        this.ongletActif = onglet;
        this.breadcrumbItems[2].label = this.capitalizeFirstLetter(onglet);
      }
    });

    if (this.isGestionnaire) {
      this.http.get<any[]>('/api/utilisateurs/non-actifs')
        .subscribe(data => this.utilisateurs = data);
    }
  }

  capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  changerOnglet(nouvelOnglet: 'ajouter' | 'modifier' | 'archiver') {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { onglet: nouvelOnglet },
      queryParamsHandling: 'merge'
    });
  }



  afficherMessageNotif(): void {
    if (this.notifMessageVisible) return;
    this.notifMessageVisible = true;
    setTimeout(() => {
      this.notifMessageVisible = false;
    }, 2000);
  }

  openInfoModal() {
    console.log('Ouverture de la modale');
    this.showInfoModal = true;
  }


}
