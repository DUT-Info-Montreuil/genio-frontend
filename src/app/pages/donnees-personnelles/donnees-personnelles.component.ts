import { Component } from '@angular/core';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-donnees-personnelles',
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './donnees-personnelles.component.html',
  standalone: true,
  styleUrls: ['./donnees-personnelles.component.css','../../../assets/styles/header.css']
})
export class DonneesPersonnellesComponent {

}
