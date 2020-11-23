import { Component, Input } from '@angular/core';
import { LayoutComponent } from 'layout';
import { Themes, ThemesHandler } from 'themes';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() layout: LayoutComponent;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  constructor(
    private themeHandler: ThemesHandler,
  ) {}

  switchTheme() {
    this.themeHandler.toggleTheme();
  }

  openAccounts() {
    this.layout.addComponent({
      component: {
        name: 'accounts',
      },
      maximizeBtn: false,
    });
  }

  openSettings() {
    this.layout.addComponent({
      component: {
        name: 'settings',
      },
      icon: 'icon-setting-gear',
      maximizeBtn: false,
    });
  }
}
