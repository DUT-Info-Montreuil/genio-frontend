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

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
