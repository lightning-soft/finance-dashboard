import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { KeyBinding, KeyBindingPart, KeyCode } from 'keyboard';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Themes, ThemesHandler } from 'themes';
import { SettingsStore } from './setting-store';
import { HotkeyEntire, ICommand, SettingsData } from './types';
import { Workspace } from 'workspace-manager';
import { ITimezone } from 'timezones-clock';
import { catchError, debounceTime, filter, shareReplay, tap } from 'rxjs/operators';
import { SaveLoaderService } from 'ui';
import { IBaseTemplate } from 'templates';
import { ISound } from 'sound';

function createCommand(name: string, UIString: string = name): ICommand {
  return {
    name,
    UIString
  };
}

export enum HotkeyEvents {
  SavePage = 'saveAll',
  // CenterAllWindows = 'CenterAllWindows',
  OpenOrderTicket = 'openOrderForm',
  OpenTradingDom = 'openDOM',
  OpenChart = 'openChart',
  OpenConnections = 'openConnections',
  LockTrading = 'lockTrading',
}

export const defaultHotkeyEntries = {
  [HotkeyEvents.SavePage]: new KeyBinding([KeyBindingPart.fromKeyCode(KeyCode.Ctrl), KeyBindingPart.fromKeyCode(KeyCode.KEY_S)]).toDTO(),
  //  [HotkeyEvents.CenterAllWindows]:
  //    new KeyBinding([KeyBindingPart.fromKeyCode(KeyCode.Ctrl), KeyBindingPart.fromKeyCode(KeyCode.Space)]).toDTO(),
  [HotkeyEvents.OpenOrderTicket]: new KeyBinding([]).toDTO(),
  [HotkeyEvents.OpenTradingDom]: new KeyBinding([]).toDTO(),
  [HotkeyEvents.OpenChart]: new KeyBinding([]).toDTO(),
  [HotkeyEvents.OpenConnections]: new KeyBinding([]).toDTO(),
  [HotkeyEvents.LockTrading]: new KeyBinding([]).toDTO(),
};


export enum NavbarPosition {
  Top = 'Top',
  Bottom = 'Bottom'
}

const defaultSettings: SettingsData = {
  theme: Themes.Dark,
  autoSave: false,
  autoSaveDelay: null,
  language: 'English',
  hotkeys: defaultHotkeyEntries,
  tradingEnabled: true,
  workspaces: [],
  timezones: [],
  localTimezoneTitle: 'Local',
  navbarPosition: NavbarPosition.Top,
  isNavbarHidden: false,
  templates: [],
  sound: {
    connected: {
      name: 'Connected',
      checked: true,
      selectedSound: 'Apert',
      volume: 80
    },
    connectionLost: {
      name: 'Connection Lost',
      checked: true,
      selectedSound: 'Beam1',
      volume: 80
    },
    orderFilled: {
      name: 'Order Filled',
      checked: true,
      selectedSound: 'Ding',
      volume: 100
    },
    orderCancelled: {
      name: 'Order Cancelled',
      checked: true,
      selectedSound: 'Beep',
      volume: 100
    },
    orderReplaced: {
      name: 'Order Replaced',
      checked: true,
      selectedSound: 'Close',
      volume: 100
    },
    orderPending: {
      name: 'Order Pending',
      checked: true,
      selectedSound: 'Blip2',
      volume: 100
    },
    orderRejected: {
      name: 'Order Rejected',
      checked: true,
      selectedSound: 'Bullet',
      volume: 100
    },
    targetFilled: {
      name: 'Target Filled',
      checked: true,
      selectedSound: 'Cashreg',
      volume: 80
    },
    stopFilled: {
      name: 'Stop Filled',
      checked: true,
      selectedSound: 'Buzz',
      volume: 100
    },
    alert: {
      name: 'Alert',
      checked: true,
      selectedSound: 'Arrowhit',
      volume: 100
    },
    isPlay: true
  }
};

@Injectable()
@UntilDestroy()
export class SettingsService {
  private _unsubscribeFunctions = [];

  settings: BehaviorSubject<SettingsData> = new BehaviorSubject(defaultSettings);

  private _isSettingsLoaded$ = new Subject<boolean>();
  isSettingsLoaded$ = this._isSettingsLoaded$.pipe(
    filter((item) => item),
    shareReplay(1));
  isSettingsLoaded = false;

  private $updateState = new Subject<void>();

  private get _settings() {
    return this.settings.value;
  }

  constructor(
    public themeHandler: ThemesHandler,
    private _settingStore: SettingsStore,
    private loaderService: SaveLoaderService,
  ) {
  }

  public init() {
    this._unsubscribeFunctions.push(this.$updateState
      .pipe(
        debounceTime(100)
      ).subscribe(() => {
        const hide = this.loaderService.showLoader();
        this._settingStore.setItem(this.settings.value).toPromise()
          .finally(() => {
            hide();
          });
      }));

    return this._settingStore
      .getItem()
      .pipe(
        catchError(() => {
          return of(defaultSettings);
        }),
        tap((s: any) => {
          if (s) {
            this._updateState(s, false);
            this.isSettingsLoaded = true;
            this._isSettingsLoaded$.next(true);
            this._isSettingsLoaded$.complete();
          }
        }),
      );
  }

  getItem(): Observable<SettingsData> {
    return this._settingStore.getItem();
  }

  get<T = any>(key: string) {
    return this.settings.value[key];
  }

  set<T = any>(key: string, value: T) {
    this._updateState({ [key]: value });
  }

  public destroy() {
    this._unsubscribeFunctions.forEach(item => item());
  }

  setAutoSave(delay?: number): void {
    this._updateState({ autoSave: true, autoSaveDelay: delay ?? null });
  }

  removeAutoSave(): void {
    this._updateState({ autoSave: false, autoSaveDelay: null });
  }

  changeTheme(theme): void {
    this._updateState({ theme });
  }

  updateTradingLock(tradingEnabled: boolean): void {
    this._updateState({ tradingEnabled });
  }

  saveState(): void {
    this.$updateState.next();
  }

  saveKeyBinding(hotkeys: HotkeyEntire) {
    this._updateState({ hotkeys });
  }

  saveWorkspaces(workspaces: Workspace[]) {
    this._updateState({ workspaces });
  }

  changeNavbarPosition(navbarPosition: NavbarPosition): void {
    this._updateState({ navbarPosition });
  }

  updateNavbarVisibility(isNavbarHidden: boolean): void {
    this._updateState({ isNavbarHidden });
  }

  save(settings: object) {
    this._updateState(settings);
  }

  saveTimezones(timezones: ITimezone[]): void {
    this._updateState({ timezones });
  }

  saveLocalTimezoneTitle(localTimezoneTitle: string): void {
    this._updateState({ localTimezoneTitle });
  }

  saveTemplates(templates: IBaseTemplate[], saveInStorage: boolean = true): void {
    this._updateState({ templates }, saveInStorage);
  }

  saveSounds(type: string, sound: ISound | boolean): void {
    let setting = this.settings.value.sound;
    setting[type] = sound;
    this._updateState({ sound: setting });
  }

  private _updateState(settings: Partial<SettingsData>, saveInStorage = true): void {
    try {
      const clonedSettings = jQuery.extend(true, {}, settings);
      this.settings.next({ ...this.settings.value, ...clonedSettings });
      if (saveInStorage)
        this.saveState();
    } catch (err) {
      console.error(settings);
    }
  }
}
