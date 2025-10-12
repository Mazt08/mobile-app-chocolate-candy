import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
  ],
})
export class HomePage {
  categories = ['Dark', 'Caramel', 'Nuts', 'Matcha'];
  featured = [
    {
      id: 1,
      name: 'Dark Truffle',
      price: 99,
      img: 'assets/catalog/dark-truffle.jpg',
      category: 'Dark',
    },
    {
      id: 2,
      name: 'Caramel Crunch',
      price: 129,
      img: 'assets/catalog/caramel-crunch.jpg',
      category: 'Caramel',
    },
    {
      id: 3,
      name: 'Hazelnut Praline',
      price: 149,
      img: 'assets/catalog/hazelnut-praline.jpg',
      category: 'Nuts',
    },
    {
      id: 4,
      name: 'Matcha Bites',
      price: 119,
      img: 'assets/catalog/matcha-bites.jpg',
      category: 'Matcha',
    },
  ];

  constructor(private router: Router, private cart: CartService) {}

  goToCatalog() {
    this.router.navigate(['/catalog']);
  }
  goToOffers() {
    this.router.navigate(['/offers']);
  }
  goToCategory(cat: string) {
    this.router.navigate(['/catalog'], { queryParams: { category: cat } });
  }
  addToCart(p: any) {
    this.cart.add({ id: p.id, name: p.name, price: p.price, img: p.img });
  }
}
