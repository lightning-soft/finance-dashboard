import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NzModalService } from 'ng-zorro-antd';
import { SettingsComponent } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { AccountsComponent } from 'accounts';
import { RithmicApiService } from 'communication';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() isOpen;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  public isVisible = true;

  constructor(
    private themeHandler: ThemesHandler,
    private modalService: NzModalService,
    private _rithmicApiService: RithmicApiService,
  ) {
    this.checkVisibility();
  }

  closeDrawer() {
    this.isOpen = false;
  }

  toggleNavigationDrawer() {
    this.isOpen = !this.isOpen;
  }

  switchTheme() {
    this.themeHandler.toggleTheme();
  }

  openAccountDialog() {
    this.modalService.create({
      nzTitle: null,
      nzContent: AccountsComponent,
      nzCloseIcon: null,
      nzFooter: null,
      nzWidth: 720,
    });
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

  logout() {
    this._rithmicApiService.logout().subscribe(
      () => {},
      (e) => console.error(e),
    );
  }
}
