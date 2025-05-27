import { Component } from '@angular/core';
import {BreadcrumbComponent} from '../../shared/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-a-propos',
  imports: [
    BreadcrumbComponent
  ],
  templateUrl: './a-propos.component.html',
  standalone: true,
  styleUrl: './a-propos.component.css'
})
export class AProposComponent {

}
