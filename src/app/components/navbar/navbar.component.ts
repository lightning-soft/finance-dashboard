import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { LayoutComponent } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { IConnection } from 'trading';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() layout: LayoutComponent;

  connection: IConnection;

  get isDark() {
    return this.themeHandler.theme === Themes.Dark;
  }

  constructor(
    private themeHandler: ThemesHandler,
    private _accountsManager: AccountsManager,
  ) {}

  ngOnInit() {
    this._accountsManager.connections
      .pipe(untilDestroyed(this))
      .subscribe((connections) => {
        const connection = this._accountsManager.getActiveConnection();

        this.connection = connection || connections[0];
      });
  }

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
