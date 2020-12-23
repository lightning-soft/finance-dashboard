import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { WebSocketService } from 'communication';
import { LayoutComponent } from 'layout';
import { SettingsService, SettingsData } from 'settings';
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

  constructor(
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

  private _save(): void {
    this._settingsService.saveState();

    if (this.activeWorkspace)
      this._workspaceService.saveWorkspaces(this.activeWorkspace.id, this.layout.saveState())
  }

  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    if (this.settings.autoSave && !this.settings.autoSaveDelay) 
      this._save();
  }
}
