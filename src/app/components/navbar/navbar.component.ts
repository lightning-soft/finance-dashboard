import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ThemeService } from '../../theme.service';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isDark = true;

  @Input() isOpen;

  constructor(private themeService: ThemeService) {
  }

  switchTheme() {
    this.themeService.switchTheme(this.isDark ? 'scxThemeLight' : 'scxThemeDark');
    this.isDark = !this.isDark;
  }

  closeDrawer() {
    this.isOpen = false;
  }

  toggleNavigationDrawer() {
    this.isOpen = !this.isOpen;
  }
}
