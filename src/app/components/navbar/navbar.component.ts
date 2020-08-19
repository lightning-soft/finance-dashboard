import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ThemesHandler, Themes } from 'themes';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  @Input() isOpen;

  constructor(private themeHandler: ThemesHandler) {
  }

  switchTheme() {
    this.themeHandler.changeTheme(this.isDark ? Themes.Light : Themes.Dark);
  }

  closeDrawer() {
    this.isOpen = false;
  }

  toggleNavigationDrawer() {
    this.isOpen = !this.isOpen;
  }
}
