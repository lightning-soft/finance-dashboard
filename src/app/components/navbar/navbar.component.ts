import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NzModalService } from 'ng-zorro-antd';
import { SettingsComponent } from 'settings';
import { Themes, ThemesHandler } from 'themes';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() layout;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  public isVisible = true;

  constructor(
    private themeHandler: ThemesHandler,
    private modalService: NzModalService,
  ) {
    this.checkVisibility();
  }

  // closeDrawer() {
  //   this.isOpen = false;
  // }

  // toggleNavigationDrawer() {
  //   this.isOpen = !this.isOpen;
  // }

  switchTheme() {
    this.themeHandler.toggleTheme();
  }

  openAccounts() {
    this.layout.addComponent('accounts');
  }

  checkVisibility() {
    if (window.location.href.includes('popup')) {
      console.log('here');
      this.isVisible = false;
    }
  }

  openSettings() {
    this.modalService.create({
      nzContent: SettingsComponent,
      nzFooter: null,
    });
  }
}
