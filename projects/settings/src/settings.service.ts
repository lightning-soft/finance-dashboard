import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { KeyBinding, KeyBindingPart, KeyCode } from 'keyboard';
import { BehaviorSubject, of } from 'rxjs';
import { Themes, ThemesHandler } from 'themes';
import { SettingsStore } from './setting-store';
import { HotkeyEntire, ICommand, SettingsData } from './types';
import { Workspace } from 'workspace-manager';
import { ITimezone } from 'timezones-clock';
import { catchError } from 'rxjs/operators';
import { SaveLoaderService } from 'ui';
import { IBaseTemplate } from "templates";
import { ISound } from 'projects/sound/src/lib/sound.interface';

function createCommand(name: string, uiSstring: string = name): ICommand {
  return {
    name,
    UIString: uiSstring
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
  sound: true,
  connectedSound: {
    name: "Connected",
    checked: true,
    selectedSound: "Apert",
    volume: 80
  },
  connectionLostSound: {
    name: "Connection Lost",
    checked: true,
    selectedSound: "Beam1",
    volume: 80
  },
  orderFilledSound: {
    name: "Order Filled",
    checked: true,
    selectedSound: "Ding",
    volume: 100
  },
  orderCancelledSound: {
    name: "Order Cancelled",
    checked: true,
    selectedSound: "Beep",
    volume: 100
  },
  orderReplacedSound: {
    name: "Order Replaced",
    checked: true,
    selectedSound: "Close",
    volume: 100
  },
  orderPendingSound: {
    name: "Order Pending",
    checked: true,
    selectedSound: "Blip2",
    volume: 100
  },
  orderRejectedSound: {
    name: "Order Rejected",
    checked: true,
    selectedSound: "Bullet",
    volume: 100
  },
  targetFilledSound: {
    name: "Target Filled",
    checked: true,
    selectedSound: "Cashreg",
    volume: 80
  },
  stopFilledSound: {
    name: "Stop Filled",
    checked: true,
    selectedSound: "Buzz",
    volume: 100
  },
  alertSound: {
    name: "Alert",
    checked: true,
    selectedSound: "Arrowhit",
    volume: 100
  },
};

@Injectable()
@UntilDestroy()
export class SettingsService {
  settings: BehaviorSubject<SettingsData> = new BehaviorSubject(defaultSettings);

  constructor(
    public themeHandler: ThemesHandler,
    private _settingStore: SettingsStore,
    private loaderService: SaveLoaderService,
  ) {
    this._init();
  }

  private _init(): void {
    this._settingStore
      .getItem()
      .pipe(
        catchError(() => {
          return of(defaultHotkeyEntries);
        }),
      )
      .subscribe(
        (s: any) => s && this._updateState(s, false),
        (e) => console.error(`Something goes wrong ${e.message}`)
      );
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
    const hide = this.loaderService.showLoader();
    this._settingStore.setItem(this.settings.value).toPromise()
      .finally(() => {
        hide();
      });
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

  saveTemplates(templates: IBaseTemplate[]): void {
    console.log(templates);
    this._updateState({ templates });
  }

  saveSound(sound: boolean): void {
    this._updateState({ sound });
  }

  saveConnectedSound(connectedSound: ISound): void {
    this._updateState({ connectedSound });
  }

  saveConnectionLostSound(connectionLostSound: ISound): void {
    this._updateState({ connectionLostSound });
  }

  saveOrderFilledSound(orderFilledSound: ISound): void {
    this._updateState({ orderFilledSound });
  }

  saveOrderCancelledSound(orderCancelledSound: ISound): void {
    this._updateState({ orderCancelledSound });
  }

  saveOrderReplacedSound(orderReplacedSound: ISound): void {
    this._updateState({ orderReplacedSound });
  }

  saveOrderPendingSound(orderPendingSound: ISound): void {
    this._updateState({ orderPendingSound });
  }

  saveOrderRejectedSound(orderRejectedSound: ISound): void {
    this._updateState({ orderRejectedSound });
  }

  saveTargetFilledSound(targetFilledSound: ISound): void {
    this._updateState({ targetFilledSound });
  }

  saveStopFilledSound(stopFilledSound: ISound): void {
    this._updateState({ stopFilledSound });
  }

  saveAlertSound(alertSound: ISound): void {
    this._updateState({ alertSound });
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
