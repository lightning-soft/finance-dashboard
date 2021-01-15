import { AfterViewInit, Component, HostListener, OnInit, Renderer2, ViewChild, NgZone } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
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

    /*
    / For performance reason avoiding ng zone in some cases
    */
    const zone = this._zone;
    Element.prototype.addEventListener = function (...args) {
      const _this = this;

      if (['wm-container'].some(i => this.classList.contains(i))) {
        const fn = args[1];
        if (typeof fn == 'function')
          args[1] = (...params) => zone.runOutsideAngular(() => fn.apply(_this, params));
      }

      return addEventListener.apply(_this, args);
    };
  }

  ngAfterViewInit() {
    this._workspaceService.workspaces
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
