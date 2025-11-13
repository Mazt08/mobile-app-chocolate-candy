import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'app-admin-reports',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-menu-button /></ion-buttons>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="filters">
        <div class="dates">
          <ion-input
            type="date"
            label="From"
            labelPlacement="stacked"
            [(ngModel)]="fromDate"
          ></ion-input>
          <ion-input
            type="date"
            label="To"
            labelPlacement="stacked"
            [(ngModel)]="toDate"
          ></ion-input>
          <ion-button (click)="applyFilters()" expand="block">Apply</ion-button>
        </div>
        <div class="preset-row">
          <button class="chip" type="button" (click)="setPreset('today')">
            Today
          </button>
          <button class="chip" type="button" (click)="setPreset(7)">7d</button>
          <button class="chip" type="button" (click)="setPreset(30)">
            30d
          </button>
          <button class="chip" type="button" (click)="setPreset(90)">
            90d
          </button>
          <button class="chip" type="button" (click)="setPreset('all')">
            All
          </button>
          <ion-button size="small" fill="outline" (click)="exportCSV()"
            >Export CSV</ion-button
          >
          <ion-button size="small" fill="outline" (click)="exportRevenueCSV()"
            >Revenue CSV</ion-button
          >
        </div>
      </div>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Overview</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="grid">
            <div class="metric">
              <div class="label">Orders</div>
              <div class="value">{{ summary.orders }}</div>
            </div>
            <div class="metric">
              <div class="label">Revenue</div>
              <div class="value">₱{{ summary.revenue | number : '1.0-2' }}</div>
            </div>
            <div class="metric">
              <div class="label">Items Sold</div>
              <div class="value">{{ summary.items }}</div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Top Products</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let t of topProducts">
              <ion-label>{{ t.name }}</ion-label>
              <div slot="end">{{ t.qty }} sold</div>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Orders Per Day</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="bars" *ngIf="daily.length; else noChart">
            <div class="bar-row" *ngFor="let d of daily">
              <div class="bar-label">{{ d.date }}</div>
              <div class="bar">
                <div
                  class="bar-fill"
                  [style.width.%]="(d.count / maxDaily) * 100"
                ></div>
                <span class="bar-value">{{ d.count }}</span>
              </div>
            </div>
          </div>
          <canvas #revenueChart class="chart"></canvas>
          <ng-template #noChart>
            <div class="muted">No data in range.</div>
          </ng-template>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [
    `
      .filters {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }
      .filters .dates {
        display: grid;
        grid-template-columns: 1fr 1fr 120px;
        gap: 8px;
      }
      .preset-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .chip {
        border: 0;
        background: rgba(0, 0, 0, 0.06);
        padding: 6px 10px;
        border-radius: 14px;
        cursor: pointer;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .metric {
        background: var(--ion-color-light);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }
      .label {
        font-size: 12px;
        color: var(--ion-color-medium);
      }
      .value {
        font-size: 20px;
        font-weight: 800;
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .bar-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 8px;
        align-items: center;
      }
      .bar-label {
        font-size: 12px;
        color: var(--ion-color-medium);
      }
      .bar {
        position: relative;
        height: 18px;
        background: rgba(0, 0, 0, 0.06);
        border-radius: 9px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        background: var(--ion-color-primary);
        opacity: 0.85;
      }
      .bar-value {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 11px;
        color: #fff;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
      }
      .muted {
        color: var(--ion-color-medium);
        font-size: 12px;
      }
      .chart {
        width: 100%;
        max-height: 260px;
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
  ],
})
export class AdminReportsPage {
  summary = { orders: 0, revenue: 0, items: 0 };
  topProducts: Array<{ name: string; qty: number }> = [];
  fromDate: string = '';
  toDate: string = '';
  allOrders: any[] = [];
  daily: Array<{ date: string; count: number }> = [];
  maxDaily = 1;
  @ViewChild('revenueChart', { static: false })
  revenueChartRef?: ElementRef<HTMLCanvasElement>;
  chart?: Chart;

  constructor(private api: ApiService) {
    this.load();
  }

  async load() {
    const orders = await firstValueFrom(this.api.getAdminOrders());
    this.allOrders = orders;
    this.summary.orders = orders.length;
    this.summary.revenue = orders.reduce(
      (s: number, o: any) => s + (o.total || 0),
      0
    );
    const map = new Map<string, number>();
    for (const o of orders) {
      for (const it of o.items || []) {
        const k = it.name || `#${it.id}`;
        map.set(k, (map.get(k) || 0) + (it.qty || 0));
        this.summary.items += it.qty || 0;
      }
    }
    this.topProducts = Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
    this.setPreset(30);
  }

  applyFilters() {
    const from = this.fromDate ? new Date(this.fromDate) : null;
    const to = this.toDate ? new Date(this.toDate) : null;
    const inRange = (o: any) => {
      const d = new Date(o.date);
      if (isNaN(d.getTime())) return true; // keep if unparseable
      if (from && d < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    };
    const list = this.allOrders.filter(inRange);
    const byDay = new Map<string, number>();
    for (const o of list) {
      const k = o.date || '';
      byDay.set(k, (byDay.get(k) || 0) + 1);
    }
    const rows = Array.from(byDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return da - db;
      });
    this.daily = rows;
    this.maxDaily = Math.max(1, ...rows.map((r) => r.count));
    this.renderChart();
  }

  setPreset(preset: number | 'today' | 'all') {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    if (preset === 'all') {
      this.fromDate = '';
      this.toDate = '';
    } else if (preset === 'today') {
      this.fromDate = fmt(today);
      this.toDate = fmt(today);
    } else {
      const start = new Date(today);
      start.setDate(today.getDate() - (preset - 1));
      this.fromDate = fmt(start);
      this.toDate = fmt(today);
    }
    this.applyFilters();
  }

  exportCSV() {
    const from = this.fromDate;
    const to = this.toDate;
    const inRange = (o: any) => {
      const d = new Date(o.date);
      if (isNaN(d.getTime())) return true;
      if (from && d < new Date(from)) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    };
    const list = this.allOrders.filter(inRange);
    const lines = [
      ['id', 'date', 'status', 'total', 'userId', 'userName', 'items'].join(
        ','
      ),
      ...list.map((o: any) =>
        [
          o.id,
          '"' + (o.date || '') + '"',
          o.status,
          o.total,
          o.user?.id ?? '',
          '"' + (o.user?.name || '') + '"',
          '"' +
            (o.items || [])
              .map((it: any) => `${it.name} x${it.qty}`)
              .join('; ') +
            '"',
        ].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportRevenueCSV() {
    const lines = [
      ['date', 'revenue'].join(','),
      ...this.daily.map((d) =>
        [
          '"' + d.date + '"',
          this.allOrders
            .filter((o) => o.date === d.date)
            .reduce((s: number, o: any) => s + Number(o.total || 0), 0),
        ].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-by-day.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private renderChart() {
    try {
      const ctx = this.revenueChartRef?.nativeElement?.getContext('2d');
      if (!ctx) return;
      const labels = this.daily.map((d) => d.date);
      // Build revenue per day based on filtered orders
      const from = this.fromDate ? new Date(this.fromDate) : null;
      const to = this.toDate ? new Date(this.toDate) : null;
      const inRange = (o: any) => {
        const d = new Date(o.date);
        if (isNaN(d.getTime())) return true;
        if (from && d < from) return false;
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
        return true;
      };
      const list = this.allOrders.filter(inRange);
      const byDayTotal = new Map<string, number>();
      for (const o of list) {
        const k = o.date || '';
        byDayTotal.set(k, (byDayTotal.get(k) || 0) + Number(o.total || 0));
      }
      const data = labels.map((k) => +(byDayTotal.get(k) || 0));
      if (this.chart) {
        this.chart.data.labels = labels as any;
        (this.chart.data.datasets[0].data as number[]) = data;
        this.chart.update();
      } else {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Revenue',
                data,
                borderColor: '#8c5a2b',
                backgroundColor: 'rgba(212,148,30,0.25)',
                tension: 0.25,
                fill: true,
                pointRadius: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } },
          },
        });
      }
    } catch {}
  }
}
