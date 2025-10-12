import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SideMenuComponent } from './shared/side-menu/side-menu.component';
import { ThemeService } from './shared/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, SideMenuComponent],
})
export class AppComponent {
  constructor(private theme: ThemeService) {
    this.theme.init();
  }
}
