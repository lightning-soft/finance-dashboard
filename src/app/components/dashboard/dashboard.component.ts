import { AfterViewInit, Component, HostListener, OnInit, Renderer2, ViewChild, NgZone } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { WebSocketService } from 'communication';
import { KeyboardListener } from 'keyboard';
import { LayoutComponent } from 'layout';
import { SettingsData, SettingsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { Workspace, WorkspacesManager } from 'workspace-manager';

export enum DashboardCommand {
  SavePage = 'save_page',
}

export const DashboardCommandToUIString = {
  [DashboardCommand.SavePage]: 'Save page'
}
@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@UntilDestroy()
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild(LayoutComponent) layout: LayoutComponent;

  settings: SettingsData;
  keysStack: KeyboardListener = new KeyboardListener();

  activeWorkspace: Workspace;

  private _autoSaveIntervalId: number;
  private _subscriptions = [];

  constructor(
    private _zone: NgZone,
    private _renderer: Renderer2,
    private _themesHandler: ThemesHandler,
    private _accountsManager: AccountsManager,
    private _websocketService: WebSocketService,
    private _settingsService: SettingsService,
    public themeHandler: ThemesHandler,
    private _workspaceService: WorkspacesManager,
  ) { }

  ngOnInit() {
    this._websocketService.connect();

    this._accountsManager.connections.subscribe(() => {
      const connection = this._accountsManager.getActiveConnection();

      if (connection)
        this._websocketService.send({ Id: connection.connectionData.apiKey });
    });

    this._setupSettings();
    this._subscribeOnKeys();

    setTimeout(() => {
      this.layout.loadState([{ "id": 1610890944402, "x": 30, "y": 30, "width": 500, "height": 500, "component": { "state": { "instrument": { "id": "ESH1", "description": "E-Mini S&P 500", "exchange": "CME", "tickSize": 0.25, "precision": 2, "symbol": "ESH1" }, "settings": { "general": {}, "hotkeys": {}, "columns": {}, "common": {}, "ltq": { "highlightBackgroundColor": "rgba(56, 58, 64, 1)" }, "price": { "backgroundColor": "rgba(16, 17, 20, 1)", "fontColor": "rgba(208, 208, 210, 1)", "highlightBackgroundColor": null, "lastTradedPriceFontColor": null, "nonTradedPriceBackColor": null, "nonTradedPriceFontColor": null, "textAlign": "center", "tradedPriceBackColor": null }, "bidDelta": { "backgroundColor": "rgba(72, 149, 245, 0.2)", "highlightBackgroundColor": "rgba(72, 149, 245, 1)" }, "askDelta": { "backgroundColor": "rgba(201, 59, 59, 0.3)", "textAlign": "center", "highlightBackgroundColor": "rgba(201, 59, 59, 1)" }, "bid": { "fontColor": "white", "backgroundColor": "rgba(72, 149, 245, 0.2)", "highlightBackgroundColor": "rgba(72, 149, 245, 1)", "textAlign": "center", "orientation": "left" }, "ask": { "fontColor": "white", "backgroundColor": "rgba(201, 59, 59, 0.3)", "histogramColor": "rgba(201, 59, 59, 0.2)", "highlightBackgroundColor": "rgba(201, 59, 59, 1)", "textAlign": "center", "orientation": "left" }, "bidDepth": { "backgroundColor": "rgba(201, 59, 59, 0.3)", "histogramColor": "rgba(201, 59, 59, 0.2)", "highlightBackgroundColor": "rgba(201, 59, 59, 1)", "textAlign": "center", "orientation": "left" }, "askDepth": { "backgroundColor": "rgba(72, 149, 245, 0.2)", "highlightBackgroundColor": "rgba(72, 149, 245, 1)", "textAlign": "center", "orientation": "left" }, "totalAsk": { "histogramColor": "rgba(72, 149, 245, 0.3)", "textAlign": "right", "fontColor": "rgba(72, 149, 245, 1)" }, "totalBid": { "histogramColor": "rgba(201, 59, 59, 0.3)", "textAlign": "right", "fontColor": "rgba(235, 90, 90, 1)" }, "volumeProfile": { "highlightBackgroundColor": "rgba(73, 187, 169, 0.3)", "orientation": "right" }, "order": {}, "currentBid": { "fontColor": "#EB5A5A", "histogramColor": "rgba(201, 59, 59, 0.4)" }, "note": {}, "currentAsk": { "fontColor": "#4895F5", "histogramColor": "rgba(72, 149, 245, 0.4)" } } }, "name": "dom" }, "order": 0 }, { "id": 1610890944425, "minimized": true, "x": 60, "y": 60, "width": 500, "height": 500, "component": { "state": { "general": {}, "hotkeys": {}, "columns": {}, "common": {}, "ltq": { "highlightBackgroundColor": "rgba(56, 58, 64, 1)" }, "price": { "backgroundColor": "rgba(16, 17, 20, 1)", "fontColor": "rgba(208, 208, 210, 1)", "highlightBackgroundColor": null, "lastTradedPriceFontColor": null, "nonTradedPriceBackColor": null, "nonTradedPriceFontColor": null, "textAlign": "center", "tradedPriceBackColor": null }, "bidDelta": { "backgroundColor": "rgba(72, 149, 245, 0.2)", "highlightBackgroundColor": "rgba(72, 149, 245, 1)" }, "askDelta": { "backgroundColor": "rgba(201, 59, 59, 0.3)", "textAlign": "center", "highlightBackgroundColor": "rgba(201, 59, 59, 1)" }, "bid": { "fontColor": "white", "backgroundColor": "rgba(72, 149, 245, 0.2)", "highlightBackgroundColor": "rgba(72, 149, 245, 1)", "textAlign": "center", "orientation": "left" }, "ask": { "fontColor": "white", "backgroundColor": "rgba(201, 59, 59, 0.3)", "histogramColor": "rgba(201, 59, 59, 0.2)", "highlightBackgroundColor": "rgba(201, 59, 59, 1)", "textAlign": "center", "orientation": "left" }, "bidDepth": { "backgroundColor": "rgba(201, 59, 59, 0.3)", "histogramColor": "rgba(201, 59, 59, 0.2)", "highlightBackgroundColor": "rgba(201, 59, 59, 1)", "textAlign": "center", "orientation": "left" }, "askDepth": { "backgroundColor": "rgba(72, 149, 245, 0.2)", "highlightBackgroundColor": "rgba(72, 149, 245, 1)", "textAlign": "center", "orientation": "left" }, "totalAsk": { "histogramColor": "rgba(72, 149, 245, 0.3)", "textAlign": "right", "fontColor": "rgba(72, 149, 245, 1)" }, "totalBid": { "histogramColor": "rgba(201, 59, 59, 0.3)", "textAlign": "right", "fontColor": "rgba(235, 90, 90, 1)" }, "volumeProfile": { "highlightBackgroundColor": "rgba(73, 187, 169, 0.3)", "orientation": "right" }, "order": {}, "currentBid": { "fontColor": "#EB5A5A", "histogramColor": "rgba(201, 59, 59, 0.4)" }, "note": {}, "currentAsk": { "fontColor": "#4895F5", "histogramColor": "rgba(72, 149, 245, 0.4)" }, "commonView": {}, "depth&Market": {}, "intervals": {} }, "name": "dom-settings" }, "order": 1 }])
    }, 100);
    /*
    / For performance reason avoiding ng zone in some cases
    */
    const zone = this._zone;
    Element.prototype.addEventListener = function (...args) {
      const _this = this;

      if (['wm-container'].some(i => this.classList.contains(i)) ||
        ['CANVAS'].includes(this.tagName)
      ) {
        const fn = args[1];
        if (typeof fn == 'function')
          args[1] = (...params) => zone.runOutsideAngular(() => fn.apply(_this, params));
      }

      return addEventListener.apply(_this, args);
    };
  }

  ngAfterViewInit() {
    this._workspaceService.workspaces
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((workspaces: Workspace[]) => {
        const activeWorkspace = workspaces.find(w => w.isActive);

        if (!activeWorkspace)
          return;

        if (this.settings?.autoSave && !this.settings?.autoSaveDelay)
          this._save();

        this.activeWorkspace = activeWorkspace;

        this._workspaceService.getWorkspaceConfig(this.activeWorkspace.configId)
          .subscribe(workspaceConfig => {
            this.layout.loadState(workspaceConfig);
          })

      });

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass();
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
  }

  private _setupSettings(): void {
    this._settingsService.settings
      .subscribe(s => {
        this.settings = { ...s };
        this.themeHandler.changeTheme(s.theme as Themes);

        if (s.autoSave && s.autoSaveDelay) {
          if (this._autoSaveIntervalId)
            clearInterval(this._autoSaveIntervalId);

          this._autoSaveIntervalId = setInterval(() => this._save(), s.autoSaveDelay);

        } else if (this._autoSaveIntervalId) {
          clearInterval(this._autoSaveIntervalId);
        }
      });
  }

  private _subscribeOnKeys() {
    this._subscriptions = [
      this._renderer.listen('document', 'keyup', this._handleEvent.bind(this)),
      this._renderer.listen('document', 'keydown', this._handleEvent.bind(this)),
    ]
  }

  private _handleEvent(event) {
    if (isInput(event && event.srcElement))
      return;

    if (!this.layout.handleEvent(event))
      this._handleKey(event);
  }

  private _handleKey(event) {
    this.keysStack.handle(event);
    const key = this.settings.hotkeys.find(([_, binding]) => binding.equals(this.keysStack))
    if (key) {
      this.handleCommand(key[0].name as DashboardCommand)
      event.preventDefault();
    }
    console.log(this.keysStack.toUIString())
  }

  private handleCommand(command: DashboardCommand) {
    switch (command) {
      case DashboardCommand.SavePage: {
        this._save();
        break;
      }
    }
  }

  private _save(): void {
    this._settingsService.saveState();

    if (this.activeWorkspace)
      this._workspaceService.saveWorkspaces(this.activeWorkspace.id, this.layout.saveState())
  }

  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    if (this.settings.autoSave && !this.settings.autoSaveDelay)
      this._save();

    for (const fn of this._subscriptions)
      fn();
  }
}

function isInput(element: Element): boolean {
  return element && element.tagName === 'INPUT';
}
