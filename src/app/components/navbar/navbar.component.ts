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

  public isVisible = true;

  @Input() isOpen;

  constructor(private themeHandler: ThemesHandler) {
    this.checkVisibility();
  }

  closeDrawer() {
    this.isOpen = false;
  }

  toggleNavigationDrawer() {
    this.isOpen = !this.isOpen;
  }

  checkVisibility() {
    if (window.location.href.includes('popup')) {
      console.log('here');
      this.isVisible = false;
    }
  }
}
