import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AProposComponent } from './pages/a-propos/a-propos.component';
import { MentionsLegalesComponent } from './pages/mentions-legales/mentions-legales.component';
import { DonneesPersonnellesComponent } from './pages/donnees-personnelles/donnees-personnelles.component';
import { PlanDuSiteComponent } from './pages/plan-du-site/plan-du-site.component';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'a-propos', component: AProposComponent },
  { path: 'mentions-legales', component: MentionsLegalesComponent },
  { path: 'donnees-personnelles', component: DonneesPersonnellesComponent },
  { path: 'plan-du-site', component: PlanDuSiteComponent }
];
