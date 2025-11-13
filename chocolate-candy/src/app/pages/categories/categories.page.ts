import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-categories',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Categories</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="chips">
        <ion-chip *ngFor="let c of categories" outline (click)="goTo(c.label)">
          <ion-icon [name]="c.icon"></ion-icon>
          <ion-label>{{ c.label }}</ion-label>
        </ion-chip>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      ion-chip {
        --color: var(--ion-color-dark);
      }
    `,
  ],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonChip,
    IonIcon,
    IonLabel,
  ],
})
export class CategoriesPage {
  categories: Array<{ label: string; icon: string }> = [];
  constructor(private router: Router, private api: ApiService) {
    this.api.getCategories().subscribe({
      next: (cats) => {
        const iconOf = (name: string) => {
          const n = name.toLowerCase();
          if (n.includes('dark')) return 'moon-outline';
          if (n.includes('milk')) return 'cafe-outline';
          if (n.includes('white')) return 'snow-outline';
          if (n.includes('caramel')) return 'flame-outline';
          if (n.includes('nut')) return 'leaf-outline';
          if (n.includes('fruit')) return 'apple-outline';
          return 'pricetag-outline';
        };
        this.categories = (cats || []).map((c: any) => {
          const label = typeof c === 'string' ? c : c.name;
          return { label, icon: iconOf(label) };
        });
      },
      error: () => {
        this.categories = [];
      },
    });
  }
  goTo(label: string) {
    this.router.navigate(['/catalog'], { queryParams: { category: label } });
  }
}
