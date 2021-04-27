import { AfterViewInit, Component, HostListener, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AccountsManager } from 'accounts-manager';
import { WebSocketService } from 'communication';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { LayoutComponent, WindowPopupManager } from 'layout';
import { HotkeyEvents, NavbarPosition, SettingsData, SettingsService } from 'settings';
import { Themes, ThemesHandler } from 'themes';
import { WorkspacesManager, WorkspaceWindow } from 'workspace-manager';
import { Components } from '../../modules';
import { widgetList } from './drag-drawer/drag-drawer.component';
import { TradeHandler } from '../navbar/trade-lock/trade-handle';
import { accountsOptions } from '../navbar/connections/connections.component';
import { filter, first } from 'rxjs/operators';
import { NzConfigService } from 'ng-zorro-antd';
import { environment } from 'environment';
import { SaveLayoutConfigService } from '../save-layout-config.service';
import { SaveLoaderService } from 'ui';

enum WindowEvents {
  Message = 'message'
}

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@UntilDestroy()
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild(LayoutComponent, { static: false }) layout: LayoutComponent;

  hasBeenSaved: boolean;

  settings: SettingsData;
  keysStack: KeyboardListener = new KeyboardListener();

  private _autoSaveIntervalId: number;
  private _subscriptions = [];

  @ViewChild('defaultEmptyContainer', { static: true }) defaultEmptyContainer;

  constructor(
    private _zone: NgZone,
    private _renderer: Renderer2,
    private readonly nzConfigService: NzConfigService,
    private _themesHandler: ThemesHandler,
    private _accountsManager: AccountsManager,
    private _websocketService: WebSocketService,
    private _settingsService: SettingsService,
    public themeHandler: ThemesHandler,
    private trade: TradeHandler,
    private _windowPopupManager: WindowPopupManager,
    private _workspaceService: WorkspacesManager,
    private saverService: SaveLayoutConfigService,
    private loaderService: SaveLoaderService,
  ) {
  }

  ngOnInit() {
    this.nzConfigService.set('empty', { nzDefaultEmptyContent: this.defaultEmptyContainer });

    this._websocketService.connect();

    this._accountsManager.activeConnection.subscribe((connection) => {
      if (connection)
        this._websocketService.send({ type: 'Id', value: connection.connectionData.apiKey });
    });

    this._setupSettings();

    setTimeout(() => {
      // this.layout.loadState([{"id":1612041491891,"x":30,"y":30,"width":500,"height":500,"component":{"state":{"columns":[{"name":"account","type":"string","title":"ACCOUNT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":0,"columnIndex":0,"rowIndex":-1},{"name":"price","type":"string","title":"PRICE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":1,"columnIndex":1,"rowIndex":-1},{"name":"size","type":"string","title":"SIZE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":2,"columnIndex":2,"rowIndex":-1},{"name":"realized","type":"string","title":"REALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":3,"columnIndex":3,"rowIndex":-1},{"name":"unrealized","type":"string","title":"UNREALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":4,"columnIndex":4,"rowIndex":-1},{"name":"total","type":"string","title":"TOTAL","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":5,"columnIndex":5,"rowIndex":-1},{"name":"instrumentName","type":"string","title":"INSTRUMENT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":6,"columnIndex":6,"rowIndex":-1},{"name":"exchange","type":"string","title":"EXCHANGE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":7,"columnIndex":7,"rowIndex":-1}]},"name":"positions"},"order":0},{"id":1612041494039,"x":340,"y":334,"width":1572,"height":735,"component":{"state":{"columns":[{"name":"averageFillPrice","type":"string","title":"AVERAGE FILL PRICE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":0,"columnIndex":0,"rowIndex":-1},{"name":"description","type":"string","title":"DESCRIPTION","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":1,"columnIndex":1,"rowIndex":-1},{"name":"duration","type":"string","title":"DURATION","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":2,"columnIndex":2,"rowIndex":-1},{"name":"filledQuantity","type":"string","title":"FILLED QUANTITY","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":3,"columnIndex":3,"rowIndex":-1},{"name":"quantity","type":"string","title":"QUANTITY","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":4,"columnIndex":4,"rowIndex":-1},{"name":"side","type":"string","title":"SIDE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":5,"columnIndex":5,"rowIndex":-1},{"name":"status","type":"string","title":"STATUS","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":6,"columnIndex":6,"rowIndex":-1},{"name":"type","type":"string","title":"TYPE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":7,"columnIndex":7,"rowIndex":-1},{"name":"exchange","type":"string","title":"EXCHANGE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":8,"columnIndex":8,"rowIndex":-1},{"name":"symbol","type":"string","title":"SYMBOL","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":9,"columnIndex":9,"rowIndex":-1},{"name":"fcmId","type":"string","title":"FCMID","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":10,"columnIndex":10,"rowIndex":-1},{"name":"ibId","type":"string","title":"IBID","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":11,"columnIndex":11,"rowIndex":-1},{"name":"identifier","type":"string","title":"IDENTIFIER","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":12,"columnIndex":12,"rowIndex":-1},{"name":"close","type":"string","title":"CLOSE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":13,"columnIndex":13,"rowIndex":-1}]},"name":"orders"},"order":1},{"id":1612041523539,"x":60,"y":60,"width":1683,"height":591,"component":{"state":{"columns":[{"name":"account","type":"string","title":"ACCOUNT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":0,"columnIndex":0,"rowIndex":-1},{"name":"price","type":"string","title":"PRICE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":1,"columnIndex":1,"rowIndex":-1},{"name":"size","type":"string","title":"SIZE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":2,"columnIndex":2,"rowIndex":-1},{"name":"realized","type":"string","title":"REALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":3,"columnIndex":3,"rowIndex":-1},{"name":"unrealized","type":"string","title":"UNREALIZED","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":4,"columnIndex":4,"rowIndex":-1},{"name":"total","type":"string","title":"TOTAL","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":5,"columnIndex":5,"rowIndex":-1},{"name":"instrumentName","type":"string","title":"INSTRUMENT","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":6,"columnIndex":6,"rowIndex":-1},{"name":"exchange","type":"string","title":"EXCHANGE","visible":true,"style":{"histogram":{"color":"#4895F5","enabled":true,"orientation":"left"},"color":"#D0D0D2","textAlign":"center"},"width":100,"index":7,"columnIndex":7,"rowIndex":-1}]},"name":"positions"},"order":2}])
    }, 100);
    /*
    / For performance reason avoiding ng zone in some cases
    */
    const zone = this._zone;
    Element.prototype.addEventListener = function(...args) {
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
    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass('scxThemeLight scxThemeDark');
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
    if (this.isPopup())
      this._loadPopupState();
    else {
      this._setupWorkspaces();
      this._subscribeOnKeys();

      window.addEventListener(WindowEvents.Message, (event) => {
        try {
          const data = event.data;
          if (typeof data !== 'string')
            return;
          const { workspaceId, windowId, state } = JSON.parse(data);
          this._workspaceService.saveWindow(+workspaceId, +windowId, state);
        } catch (err) {
          console.error(err);
        }
      });
    }

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass();
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });

    window.onbeforeunload = (e) => {
      for (const fn of this._subscriptions)
        fn();
      if (this.hasBeenSaved || !environment.production || this._windowPopupManager.isPopup())
        return;
      e = e || window.event;

      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = true;
      }
      // For Safari
      return true;
    };
  }


  isPopup() {
    return this._windowPopupManager.isPopup();
  }

  shouldShowToolBar() {
    return this._windowPopupManager.shouldShowToolbar();
  }

  isWindowPopup() {
    return this._windowPopupManager.isWindowPopup();
  }

  private _loadPopupState() {
    if (this._windowPopupManager.isWindowPopup()) {
      this._loadPopupWindow();
    } else {
      const options = this._windowPopupManager.getConfig();
      if (!options)
        return;
      const config = options.layoutConfig;
      if (config.length === 1) {
        config[0].styles = { height: '100%', width: '100%' };
      }
      this.layout.loadState(config);
      this._windowPopupManager.hideWindowHeaderInstruments = options.hideWindowHeaderInstruments;
      this._windowPopupManager.deleteConfig();
    }

  }

  _loadPopupWindow() {
    this._subscribeOnKeys();
    this.layout.loadEmptyState();
    this.setupReloadWindows();
    this._workspaceService.workspaceInit
      .pipe(
        filter(item => item),
        first(),
        untilDestroyed(this))
      .subscribe(() => {
        const workspaceId = +this._windowPopupManager.workspaceId;
        this._workspaceService.switchWorkspace(workspaceId, false);
        const windowId = +this._windowPopupManager.windowId;
        this._workspaceService.switchWindow(windowId);
      });
  }

  private _setupWorkspaces() {
    this._workspaceService.deletedWindow$
      .pipe(untilDestroyed(this))
      .subscribe((workspaceWindow: WorkspaceWindow) => {
        if (!workspaceWindow)
          return;
        this.layout.removeComponent((item) => {
          return workspaceWindow.config.some(config => item.id === config.id);
        });
      });
    this._workspaceService.save$
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this._save();
      });

    this._setupReloadWorkspaces();
  }

  private _setupReloadWorkspaces() {
    this._workspaceService.reloadWorkspace$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(async () => {
        const workspaces = this._workspaceService.workspaces.value;
        const activeWorkspace = workspaces.find(w => w.isActive);

        if (!activeWorkspace)
          return;

        const config = this._workspaceService.getWorkspaceConfig().map(item => {
          item.visible = false;
          return item;
        });
        await this.layout.loadState(config, true);
        const windowId = this._workspaceService.getCurrentWindow()?.id;
        if (windowId != null)
          this._workspaceService.switchWindow(windowId);
      });
    this.setupReloadWindows();
  }

  setupReloadWindows() {
    this._workspaceService.reloadWindows$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => {
        const workspaces = this._workspaceService.workspaces.value;
        const activeWorkspace = workspaces.find(w => w.isActive);

        if (!activeWorkspace)
          return;

        const config = this._workspaceService.getConfig();
        this.layout.loadState(config, false);
      });
  }

  private _setupSettings(): void {
    this._settingsService.settings
      .subscribe(s => {
        this.settings = { ...s };
        this.themeHandler.changeTheme(s.theme as Themes);

        $('body').removeClass('navbarTop navbarBottom');
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

  @HostListener('click')
  handleClick() {
    this.hasBeenSaved = false;
  }

  private _subscribeOnKeys() {
    this._subscriptions = [
      this._renderer.listen('document', 'keyup', this._handleEvent.bind(this)),
      this._renderer.listen('document', 'keydown', this._handleEvent.bind(this)),
    ];
  }

  private _handleEvent(event) {
    if (isInput(event && event.srcElement))
      return;

    if (!this.layout.handleEvent(event))
      this._handleKey(event);
  }

  private _handleKey(event) {
    this.keysStack.handle(event);
    const hotkeys = Object.entries(this.settings.hotkeys);
    const key: any = hotkeys.find(([_, bindingDTO]) => {
      if (bindingDTO.parts.length)
        return KeyBinding.fromDTO(bindingDTO).equals(this.keysStack);
    });
    if (key) {
      event.preventDefault();
      this.handleCommand(key[0]);
    }
  }

  private handleCommand(command: HotkeyEvents) {
    switch (command) {
      case HotkeyEvents.SavePage: {
        this._save();
        break;
      }
      case HotkeyEvents.OpenChart: {
        this._addComponent(Components.Chart);
        break;
      }
      case HotkeyEvents.OpenOrderTicket: {
        this._addComponent(Components.OrderForm);
        break;
      }
      /*   case HotkeyEvents.CenterAllWindows: {
           break;
         }*/
      case HotkeyEvents.OpenTradingDom: {
        this._addComponent(Components.Dom);
        break;
      }
      case HotkeyEvents.OpenConnections: {
        this.layout.addComponent({
          component: { name: Components.Accounts, state: {} },
          ...accountsOptions
        });
        break;
      }
      case HotkeyEvents.LockTrading: {
        this.trade.toggleTradingEnabled();
        break;
      }
    }
  }

  private _addComponent(component: string) {
    const widgetOptions = widgetList.find(item => item.component === component);
    if (widgetOptions) {
      this.layout.addComponent({
        component: {
          name: widgetOptions.component,
        },
        ...widgetOptions.options
      });
    } else {
      console.error(`Component ${component} not found, make sure spelling is correct`);
    }
  }

  private async _save() {
    await this.saverService.save(this.layout.getState());
    this.hasBeenSaved = true;
  }
}

function isInput(element: Element): boolean {
  return element && element.tagName === 'INPUT' || element.classList.contains('hotkey-input');
}
