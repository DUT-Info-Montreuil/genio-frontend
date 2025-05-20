import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AProposComponent } from './pages/a-propos/a-propos.component';
import { MentionsLegalesComponent } from './pages/mentions-legales/mentions-legales.component';
import { DonneesPersonnellesComponent } from './pages/donnees-personnelles/donnees-personnelles.component';
import { PlanDuSiteComponent } from './pages/plan-du-site/plan-du-site.component';
import {ConsulterModeleTousComponent} from './pages/consulter-modele-tous/consulter-modele-tous.component';
import { DetailsModeleComponent } from './pages/details-modele/details-modele.component';
import { ModifierModeleComponent } from './pages/modifier-modele/modifier-modele.component';
import { MotDePasseOublieComponent } from './pages/mot-de-passe-oublie/mot-de-passe-oublie.component';
import {ResetPasswordComponent} from './pages/reset-password/reset-password.component';
import {GestionUtilisateursComponent} from './pages/gestion-utilisateurs/gestion-utilisateurs.component';
import {BreadcrumbComponent} from './shared/breadcrumb/breadcrumb.component';
import {HistoriqueConventionsComponent} from './pages/historique-conventions/historique-conventions.component';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'a-propos', component: AProposComponent },
  { path: 'mentions-legales', component: MentionsLegalesComponent },
  { path: 'donnees-personnelles', component: DonneesPersonnellesComponent },
  { path: 'plan-du-site', component: PlanDuSiteComponent },
  {path: 'consulter-modeles', component: ConsulterModeleTousComponent},
  { path: 'details-modele/:id', component: DetailsModeleComponent },
  { path: 'modifier-modele/:id', component: ModifierModeleComponent },
  { path: 'mot-de-passe-oublie', component: MotDePasseOublieComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'gestion-utilisateurs', component: GestionUtilisateursComponent },
  { path: 'breadcrumb', component: BreadcrumbComponent },
  { path: 'historique-conventions', component: HistoriqueConventionsComponent }

];
