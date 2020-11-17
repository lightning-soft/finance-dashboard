import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { WebSocketService } from 'communication';
import { LayoutComponent } from 'layout';
import { SettignsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@UntilDestroy()
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild(LayoutComponent) layout: LayoutComponent;


  constructor(
    private _themesHandler: ThemesHandler,
    private _accountsManager: AccountsManager,
    private _websocketService: WebSocketService,
    private _settingsService: SettignsService,
  ) { }

  ngOnInit() {
    this._websocketService.connect();

    this._accountsManager.connections.subscribe(() => {
      const connection = this._accountsManager.getActiveConnection();

      if (connection)
        this._websocketService.send({ Id: connection.connectionData.apiKey });
    });
  }

  ngAfterViewInit() {
    this.layout.loadState();

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass();
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
  }
}
