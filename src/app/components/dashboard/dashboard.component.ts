import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { LayoutComponent } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { WebSocketService } from 'communication';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AccountsManager } from '../../../../projects/accounts-manager/src/accounts-manager';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@UntilDestroy()
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild(LayoutComponent) layout: LayoutComponent;


  constructor(private _themesHandler: ThemesHandler,
    private _accountsManager: AccountsManager,
    private _websocketService: WebSocketService) { }

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
