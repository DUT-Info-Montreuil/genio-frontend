import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-breadcrumb',
  imports: [
    RouterLink,
    NgIf,
    NgForOf
  ],
  templateUrl: './breadcrumb.component.html',
  standalone: true,
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  @Input() items: { label: string, url?: string }[] = [];



}
