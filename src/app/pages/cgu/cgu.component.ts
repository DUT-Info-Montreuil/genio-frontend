import { Component } from '@angular/core';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-cgu',
  imports: [
    BreadcrumbComponent,
    RouterLink
  ],
  templateUrl: './cgu.component.html',
  standalone: true,
  styleUrl: './cgu.component.css'
})
export class CguComponent {

}
