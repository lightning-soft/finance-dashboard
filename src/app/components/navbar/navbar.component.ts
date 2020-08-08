import { Component } from '@angular/core';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent  {
  isDark = true;

  constructor(private themeService: ThemeService) { }

  switchTheme() {
    this.themeService.switchTheme(this.isDark ?  'scxThemeLight' : 'scxThemeDark');
    this.isDark = !this.isDark;
  }
}
