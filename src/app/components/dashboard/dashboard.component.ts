import { AfterViewInit, Component, HostListener, OnInit, Renderer2, ViewChild, NgZone } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { WebSocketService } from 'communication';
import { KeyboardListener } from 'keyboard';
import { LayoutComponent } from 'layout';
import { NavbarPosition, SettingsData, SettingsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { Workspace, WorkspacesManager } from 'workspace-manager';

export enum DashboardCommand {
  SavePage = 'save_page',
  Copy = 'Copy',
  Paste = 'Paste',
  CUT = 'Cut',
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
  ) {
  }

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
      // this.layout.loadState([{"id":1612041491891,"x":30,"y":30,"width":500,"height":500,"component":{"state":{"columns":[{"name":"account","type":"string","title":"ACCOUNT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":0,"columnIndex":0,"rowIndex":-1},{"name":"price","type":"string","title":"PRICE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":1,"columnIndex":1,"rowIndex":-1},{"name":"size","type":"string","title":"SIZE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":2,"columnIndex":2,"rowIndex":-1},{"name":"realized","type":"string","title":"REALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":3,"columnIndex":3,"rowIndex":-1},{"name":"unrealized","type":"string","title":"UNREALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":4,"columnIndex":4,"rowIndex":-1},{"name":"total","type":"string","title":"TOTAL","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":5,"columnIndex":5,"rowIndex":-1},{"name":"instrumentName","type":"string","title":"INSTRUMENT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":6,"columnIndex":6,"rowIndex":-1},{"name":"exchange","type":"string","title":"EXCHANGE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":7,"columnIndex":7,"rowIndex":-1}]},"name":"positions"},"order":0},{"id":1612041494039,"x":340,"y":334,"width":1572,"height":735,"component":{"state":{"columns":[{"name":"averageFillPrice","type":"string","title":"AVERAGE FILL PRICE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":0,"columnIndex":0,"rowIndex":-1},{"name":"description","type":"string","title":"DESCRIPTION","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":1,"columnIndex":1,"rowIndex":-1},{"name":"duration","type":"string","title":"DURATION","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":2,"columnIndex":2,"rowIndex":-1},{"name":"filledQuantity","type":"string","title":"FILLED QUANTITY","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":3,"columnIndex":3,"rowIndex":-1},{"name":"quantity","type":"string","title":"QUANTITY","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":4,"columnIndex":4,"rowIndex":-1},{"name":"side","type":"string","title":"SIDE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":5,"columnIndex":5,"rowIndex":-1},{"name":"status","type":"string","title":"STATUS","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":6,"columnIndex":6,"rowIndex":-1},{"name":"type","type":"string","title":"TYPE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":7,"columnIndex":7,"rowIndex":-1},{"name":"exchange","type":"string","title":"EXCHANGE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":8,"columnIndex":8,"rowIndex":-1},{"name":"symbol","type":"string","title":"SYMBOL","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":9,"columnIndex":9,"rowIndex":-1},{"name":"fcmId","type":"string","title":"FCMID","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":10,"columnIndex":10,"rowIndex":-1},{"name":"ibId","type":"string","title":"IBID","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":11,"columnIndex":11,"rowIndex":-1},{"name":"identifier","type":"string","title":"IDENTIFIER","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":12,"columnIndex":12,"rowIndex":-1},{"name":"close","type":"string","title":"CLOSE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":13,"columnIndex":13,"rowIndex":-1}]},"name":"orders"},"order":1},{"id":1612041523539,"x":60,"y":60,"width":1683,"height":591,"component":{"state":{"columns":[{"name":"account","type":"string","title":"ACCOUNT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":0,"columnIndex":0,"rowIndex":-1},{"name":"price","type":"string","title":"PRICE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":1,"columnIndex":1,"rowIndex":-1},{"name":"size","type":"string","title":"SIZE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":2,"columnIndex":2,"rowIndex":-1},{"name":"realized","type":"string","title":"REALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":3,"columnIndex":3,"rowIndex":-1},{"name":"unrealized","type":"string","title":"UNREALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":4,"columnIndex":4,"rowIndex":-1},{"name":"total","type":"string","title":"TOTAL","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":5,"columnIndex":5,"rowIndex":-1},{"name":"instrumentName","type":"string","title":"INSTRUMENT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":6,"columnIndex":6,"rowIndex":-1},{"name":"exchange","type":"string","title":"EXCHANGE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":7,"columnIndex":7,"rowIndex":-1}]},"name":"positions"},"order":2}])
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
    this._workspaceService.save
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (this.settings?.autoSave && !this.settings?.autoSaveDelay)
          this._save();
      });
    this._workspaceService.reload
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        const workspaces = this._workspaceService.workspaces.value;
        const activeWorkspace = workspaces.find(w => w.isActive);

        if (!activeWorkspace)
          return;

        const config = this._workspaceService.getWorkspaceConfig();
        this.layout.loadState(config);

      });

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass('scxThemeLight').removeClass('scxThemeDark');
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
  }

  private _setupSettings(): void {
    this._settingsService.settings
      .subscribe(s => {
        this.settings = {...s};
        this.themeHandler.changeTheme(s.theme as Themes);

        $('body').removeClass('navbarTop').removeClass('navbarBottom');
        $('body').addClass(s.navbarPosition === NavbarPosition.Top ? 'navbarTop' : 'navbarBottom');

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
      /*     case DashboardCommand.CUT: {
             console.log(command);
             break;
           }
           case DashboardCommand.Copy: {
             console.log(command);
             break;
           }
           case DashboardCommand.Paste: {
             console.log(command);
             break;
           }*/
    }
  }

  private async _save() {
    //   this._settingsService.saveState(); saveWorkspaces also saves settings

    if (this._workspaceService.getActiveWorkspace()) {
      await this._workspaceService.saveWorkspaces(this._workspaceService.getActiveWorkspace().id, this.layout.saveState());
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  async beforeUnloadHandler(e) {
    for (const fn of this._subscriptions)
      fn();
    e = e || window.event;

    // For IE and Firefox prior to version 4
    if (e) {
      e.returnValue = true;
    }
    // For Safari
    return true;
  }
}

function isInput(element: Element): boolean {
  return element && element.tagName === 'INPUT';
}
