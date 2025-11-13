import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-admin-products',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button /></ion-buttons>
        <ion-title>Products</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="toolbar">
        <ion-input
          placeholder="Search products..."
          [(ngModel)]="search"
          (ionInput)="applyFilter()"
        ></ion-input>
        <ion-button size="small" fill="outline" (click)="exportCSVProducts()"
          >Export CSV</ion-button
        >
      </div>
      <form class="editor" (ngSubmit)="save()">
        <div class="row">
          <ion-input
            placeholder="Name"
            [(ngModel)]="edit.name"
            name="name"
            required
          ></ion-input>
          <ion-input
            placeholder="Price"
            type="number"
            inputmode="decimal"
            [(ngModel)]="edit.price"
            name="price"
            required
          ></ion-input>
        </div>
        <div class="row">
          <ion-select
            interface="popover"
            placeholder="Category"
            [(ngModel)]="edit.category"
            name="category"
          >
            <ion-select-option *ngFor="let c of categories" [value]="c">{{
              c
            }}</ion-select-option>
          </ion-select>
          <ion-input
            placeholder="Weight (e.g., 100g)"
            [(ngModel)]="edit.weight"
            name="weight"
          ></ion-input>
        </div>
        <ion-input
          placeholder="Image URL"
          [(ngModel)]="edit.img"
          name="img"
        ></ion-input>
        <div class="row file-row">
          <div
            class="dropzone"
            (dragover)="onDragOver($event)"
            (drop)="onDrop($event)"
          >
            <span>Drop image here or choose</span>
            <input type="file" accept="image/*" (change)="onFile($event)" />
          </div>
          <img
            *ngIf="edit.img"
            [src]="edit.img"
            alt="Preview"
            class="preview"
          />
        </div>
        <div class="error" *ngIf="fileError">{{ fileError }}</div>
        <ion-input
          placeholder="Description"
          [(ngModel)]="edit.description"
          name="description"
        ></ion-input>
        <div class="actions">
          <ion-button type="submit"
            >{{ edit.id ? 'Update' : 'Add' }} Product</ion-button
          >
          <ion-button
            fill="clear"
            color="medium"
            (click)="reset()"
            type="button"
            >Clear</ion-button
          >
        </div>
      </form>

      <ion-list>
        <ion-item *ngFor="let p of filtered">
          <ion-label>
            <div class="name">{{ p.name }}</div>
            <div class="meta">
              ₱{{ p.price }} · {{ p.category || 'Uncategorized' }}
            </div>
          </ion-label>
          <ion-button fill="clear" (click)="editItem(p)"
            ><ion-icon name="create-outline"></ion-icon
          ></ion-button>
          <ion-button color="danger" fill="clear" (click)="remove(p)"
            ><ion-icon name="trash-outline"></ion-icon
          ></ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 10px;
      }
      .editor {
        display: grid;
        gap: 8px;
        margin-bottom: 12px;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .file-row {
        align-items: center;
        grid-template-columns: 1fr 80px;
      }
      .dropzone {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px;
        border: 1px dashed rgba(0, 0, 0, 0.3);
        border-radius: 8px;
      }
      .preview {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      .error {
        color: var(--ion-color-danger, #e74c3c);
        font-size: 12px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .name {
        font-weight: 700;
      }
      .meta {
        color: var(--ion-color-medium);
        font-size: 12px;
      }
    `,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
  ],
})
export class AdminProductsPage {
  products: any[] = [];
  filtered: any[] = [];
  categories: string[] = [];
  search = '';
  fileError = '';
  edit: any = {
    name: '',
    price: null,
    category: '',
    weight: '',
    img: '',
    description: '',
  };
  constructor(private api: ApiService) {
    this.load();
  }
  async load() {
    const [prods, cats] = await Promise.all([
      firstValueFrom(this.api.getAdminProducts()),
      firstValueFrom(this.api.getCategories()),
    ]);
    this.products = prods || [];
    this.categories = cats || [];
    this.applyFilter();
  }
  applyFilter() {
    const q = this.search.trim().toLowerCase();
    this.filtered = !q
      ? [...this.products]
      : this.products.filter((p) =>
          [p.name, p.category, p.description]
            .filter(Boolean)
            .some((v: string) => v.toLowerCase().includes(q))
        );
  }
  onFile(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    this.handleImageFile(input.files[0]);
  }
  onDragOver(e: DragEvent) {
    e.preventDefault();
  }
  onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleImageFile(file);
  }
  private handleImageFile(file: File) {
    this.fileError = '';
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please upload an image file.';
      return;
    }
    const max = 1.5 * 1024 * 1024; // 1.5MB
    if (file.size > max) {
      this.fileError = 'Image is too large. Max 1.5MB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.edit.img = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  exportCSVProducts() {
    const list = this.filtered.length ? this.filtered : this.products;
    const lines = [
      ['id', 'name', 'price', 'category', 'weight', 'img'].join(','),
      ...list.map((p: any) =>
        [
          p.id ?? '',
          '"' + (p.name || '') + '"',
          p.price ?? '',
          '"' + (p.category || '') + '"',
          '"' + (p.weight || '') + '"',
          '"' + (p.img || '') + '"',
        ].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  editItem(p: any) {
    this.edit = { ...p };
  }
  reset() {
    this.edit = {
      name: '',
      price: null,
      category: '',
      weight: '',
      img: '',
      description: '',
    };
  }
  async save() {
    const payload = { ...this.edit, price: Number(this.edit.price) };
    if (payload.id) {
      await firstValueFrom(this.api.updateAdminProduct(payload.id, payload));
    } else {
      await firstValueFrom(this.api.createAdminProduct(payload));
    }
    this.reset();
    await this.load();
  }
  async remove(p: any) {
    if (!confirm(`Delete ${p.name}?`)) return;
    await firstValueFrom(this.api.deleteAdminProduct(p.id));
    await this.load();
  }
}
