import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'environment';
import { KeyBinding, KeyboardListener } from 'keyboard';
import { closeCommand, highligtCommand, LayoutComponent, saveCommand, WindowPopupManager } from 'layout';
import { NzConfigService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { filter, first } from 'rxjs/operators';
import { HotkeyEvents, NavbarPosition, SettingsData, SettingsService } from 'settings';
import { Sound, SoundService } from 'sound';
import { Themes, ThemesHandler } from 'themes';
import { OrdersFeed, OrderStatus, OrderType } from 'trading';
import { isEqual } from 'underscore';
import { WindowMessengerService } from 'window-messenger';
import { WorkspacesManager, WorkspaceWindow } from 'workspace-manager';
import { isElectron } from '../../is-electron';
import { Components } from '../../modules';
import { accountsOptions } from '../navbar/connections/connections.component';
import { TradeHandler } from '../navbar/trade-lock/trade-handle';
import { SaveLayoutConfigService, saveLayoutKey } from '../save-layout-config.service';
import { widgetList } from './component-options';
import { DOCUMENT } from '@angular/common';

const OrderStatusToSound = {
  [OrderStatus.Filled]: Sound.ORDER_FILLED,
  [OrderStatus.Canceled]: Sound.ORDER_CANCELLED,
  [OrderStatus.Rejected]: Sound.ORDER_REJECTED,
  [OrderStatus.Pending]: Sound.ORDER_PENDING,
  [OrderStatus.Rejected]: Sound.ORDER_REJECTED,
};

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
@UntilDestroy()
export class DashboardComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(LayoutComponent, { static: false }) layout: LayoutComponent;

  hasBeenSaved: boolean;

  settings: SettingsData;
  keysStack: KeyboardListener = new KeyboardListener();

  private _autoSaveIntervalId: number;
  private _subscriptions = [];

  @ViewChild('defaultEmptyContainer', { static: true }) defaultEmptyContainer;
  _active = false;


  set isActive(value: boolean) {
    if (value === this._active)
      return;

    this._active = value;
    if (value)
      this._renderer.addClass(this.document.body, 'highligt');
    else
      this._renderer.removeClass(this.document.body, 'highligt');
  }

  constructor(
    private _zone: NgZone,
    private _renderer: Renderer2,
    private readonly nzConfigService: NzConfigService,
    private _themesHandler: ThemesHandler,
    private _settingsService: SettingsService,
    private _ordersFeed: OrdersFeed,
    private _soundService: SoundService,
    public themeHandler: ThemesHandler,
    private trade: TradeHandler,
    private _windowPopupManager: WindowPopupManager,
    private _workspaceService: WorkspacesManager,
    private saverService: SaveLayoutConfigService,
    private _notifier: NotifierService,
    private _cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private windowMessengerService: WindowMessengerService,
  ) {
  }

  ngOnInit() {
    this._settingsService.init()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
      }, error => {
        console.error(error);
        this._notifier.showError('Something went wrong during loading settings');
      });
    this.nzConfigService.set('empty', { nzDefaultEmptyContent: this.defaultEmptyContainer });

    this._setupSettings();
    this._subscribeToOrders();
    /*
    / For performance reason avoiding ng zone in some cases
    */
    // const zone = this._zone;
    // Element.prototype.addEventListener = function (...args) {
    //   const _this = this;

    //   if (['wm-container'].some(i => this.classList.contains(i)) ||
    //     ['CANVAS'].includes(this.tagName)
    //   ) {
    //     const fn = args[1];
    //     if (typeof fn == 'function')
    //       args[1] = (...params) => zone.runOutsideAngular(() => fn.apply(_this, params));
    //   }

    //   return addEventListener.apply(_this, args);
    // };
  }

  ngAfterViewInit() {
    // prevent to show browser`s menu
    this._renderer.listen('document', 'contextmenu', (e: MouseEvent) => {
      if (isInput(e.target as HTMLElement))
        e.preventDefault();
    });

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass('scxThemeLight scxThemeDark');
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
    if (this.isPopup())
      this._loadPopupState();
    else {
      this._setupWorkspaces();
      this._subscribeOnKeys();
      const unsubscribeCallback = this.windowMessengerService.subscribe(saveLayoutKey, (paylaod) => {
        const { workspaceId, windowId, state } = paylaod;
        this._workspaceService.saveWindow(+workspaceId, +windowId, state);
      });
      this._subscriptions.push(unsubscribeCallback);
    }

    this._workspaceService.workspaceInit
      .pipe(
        filter(item => item),
        first(),
        untilDestroyed(this),
      ).subscribe(() => {
        this._windowPopupManager.init(this._workspaceService.workspaces.value);
      });

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass();
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
    if (isElectron()) {
      this.windowMessengerService.subscribe(highligtCommand, ({ workspaceId, windowId }) => {
        if (!this._workspaceService.checkIfCurrentWindow(workspaceId, windowId))
          return;

        this.isActive = true;
        setTimeout(() => {
          this.isActive = false;
        }, 2000);
      });
      window.addEventListener('focus', () => {
        this.isActive = true;
      });
      window.addEventListener('blur', () => {
        this.isActive = false;
      });
    }
    const set = new Set<() => void>();
    const paramsMap = new Map<(arg?) => void, any>();

    (window as any)._requestAnimationFrame = (window as any).requestAnimationFrame;

    (window as any).requestAnimationFrame = (callback: () => void): number => {
      if (!set.size) {
        (window as any)._requestAnimationFrame(() => {
          if (!set.size)
            return;
          // we use _requestAnimationFrame in _requestAnimationFrame to avoiding use try/catch
          set.forEach(fn => (window as any)._requestAnimationFrame(fn));
          set.clear();
        });
      }

      if (callback != null && !set.has(callback))
        set.add(callback);

      return 0;
    };

    (window as any).lastFn = (callback: (arg?) => void, arg) => {
      if (paramsMap.size === 0)
        requestAnimationFrame(() => {
          paramsMap.forEach((value, key, map) => key(value));
          paramsMap.clear();
        });

      paramsMap.set(callback, arg);
    };

    window.onbeforeunload = (e) => {
      for (const fn of this._subscriptions)
        fn();
      if (this.hasBeenSaved || isElectron() || !environment.production || this._windowPopupManager.isPopup())
        return;
      e = e || window.event;

      // For IE and Firefox prior to version 4
      if (e) {
        e.returnValue = true;
      }
      // For Safari
      return true;
    };
    this.windowMessengerService.subscribe(closeCommand, () => {
      window.close();
    });
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
        this.windowMessengerService.subscribe(saveCommand, () => {
          this.save();
        });
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
        this.save();
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

  private _subscribeToOrders() {
    this._ordersFeed.on((order) => {
      let sound;
      if (order.status === OrderStatus.Filled && (order.type === OrderType.StopLimit || order.type === OrderType.StopMarket))
        sound = Sound.STOP_FILLED;
      else
        sound = OrderStatusToSound[order.status];

      console.log('Order status', order.status);
      if (sound != null) {
        this.debouncedPlaySound(sound);
      } else {
        console.warn('Invalid sound', sound, ' for ', order.status);
      }
    });
  }

  debouncedPlaySound = debounce((sound) => {
    this._soundService.play(sound);
  }, 10);


  private _setupSettings(): void {
    this._settingsService.settings
      .subscribe(s => {
        this.settings = { ...s };
        this.themeHandler.changeTheme(s.theme as Themes);
        const body = $('body');
        body.removeClass('navbarTop navbarBottom');
        body.addClass(s.navbarPosition === NavbarPosition.Top ? 'navbarTop' : 'navbarBottom');
        if (isElectron())
          $('body').addClass('electron');

        if (s.autoSave && s.autoSaveDelay) {
          if (this._autoSaveIntervalId)
            clearInterval(this._autoSaveIntervalId);

          this._autoSaveIntervalId = setInterval(() => this.save(), s.autoSaveDelay);

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
      if (needHandleCommand(event, key[1]?.parts?.map(i => i.keyCode))) {
        event.preventDefault();
        this.handleCommand(key[0]);
      }
    }
  }

  private handleCommand(command: HotkeyEvents) {
    switch (command) {
      case HotkeyEvents.SavePage: {
        this.save();
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

  async save() {
    await this.saverService.save(this.layout.getState());
    this.hasBeenSaved = true;
  }

  ngOnDestroy() {
    this._settingsService.destroy();
    this.debouncedPlaySound.clear();
  }
}

const keysAlwaysToHandle: number[][] = [
  [17, 83] // CTRL + S:
];

function debounce(func, time) {
  let timeout;

  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), time);
  }

  debounced.clear = () => clearTimeout(timeout);

  return debounced;
}

function needHandleCommand(event: KeyboardEvent, keys: number[]): boolean {
  const element = event?.target as HTMLElement;

  if (!element)
    return true;

  return (!isInput(element) && !element.classList.contains('hotkey-input')) ||
    keysAlwaysToHandle.some(i => isEqual(i, keys));
}

function isInput(element: HTMLElement): boolean {
  return element.tagName === 'INPUT';
}
