import { AfterViewInit, Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { WebSocketService } from 'communication';
import { LayoutComponent } from 'layout';
import { SettingsData, SettingsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { Workspace, WorkspacesManager } from 'workspace-manager';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@UntilDestroy()
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild(LayoutComponent) layout: LayoutComponent;

  settings: SettingsData;

  activeWorkspace: Workspace;

  private _autoSaveIntervalId: number;

  private _subscriptions = [];

  constructor(
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
