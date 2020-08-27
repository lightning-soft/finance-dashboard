import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ThemesHandler, Themes } from 'themes';
import {AccountsComponent} from '../../modules/accounts/accounts.component';
import {NzModalService} from 'ng-zorro-antd';

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

  constructor(private themeHandler: ThemesHandler, private modal: NzModalService) {
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

  openAccountDialog() {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: AccountsComponent,
      nzCloseIcon: null,
      nzFooter: null,
      nzWidth: 720,
    });

  }
}
