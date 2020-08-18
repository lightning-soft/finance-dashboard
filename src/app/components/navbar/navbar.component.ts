import { Component, EventEmitter, Input, Output} from '@angular/core';
import {ThemeService} from '../../theme.service';
import {UntilDestroy} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isDark = true;

  @Input() isOpen;

  @Output() drawerToggle = new EventEmitter<boolean>();

  constructor(private themeService: ThemeService,
  ) {
  }

  switchTheme() {
    this.themeService.switchTheme(this.isDark ? 'scxThemeLight' : 'scxThemeDark');
    this.isDark = !this.isDark;
  }

  toggleNavigationDrawer() {
    this.drawerToggle.emit(!this.isOpen);
  }
}
