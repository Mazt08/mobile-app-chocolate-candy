import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import type { Product, ProductCategory } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, ProductCardComponent],
  template: `
    <ng-container *ngFor="let cat of categories">
      <h2 class="section-title">{{ cat.name }}</h2>
      <ion-grid fixed>
        <ion-row>
          <ion-col
            size="6"
            sizeMd="6"
            sizeLg="4"
            sizeXl="3"
            *ngFor="let p of cat.products"
          >
            <app-product-card
              [product]="p"
              (add)="add.emit($event)"
            ></app-product-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ng-container>
  `,
})
export class ProductListComponent {
  @Input() categories: ProductCategory[] = [];
  @Output() add = new EventEmitter<Product>();
}
