import {Component, Input} from '@angular/core';
import {ThemeService} from '../../theme.service';
import {NavigationDrawerService} from '../dashboard/navigation-drawer.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isDark = true;
  isOpen$ = this.navigationDrawerService.isOpen$;

  constructor(private themeService: ThemeService,
              private navigationDrawerService: NavigationDrawerService
  ) {
  }

  switchTheme() {
    this.themeService.switchTheme(this.isDark ? 'scxThemeLight' : 'scxThemeDark');
    this.isDark = !this.isDark;
  }

  toggleNavigationDrawer() {
    this.navigationDrawerService.toggle();
  }
}
