import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { KeyBinding, SettingsKeyboardListener } from 'keyboard';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { defaultHotkeyEntries, HotkeyEvents, SettingsService } from './settings.service';
import { SettingsData } from './types';

export enum SAVE_DALEY {
  FIVE_MIN = 300000,
  AUTO_SAVE = 'AUTO_SAVE',
  MANUAL_SAVE = 'MANUAL_SAVE',
}
const hotkeyStringRepresentation = {
  [HotkeyEvents.SavePage]: 'Save All Settings',
  [HotkeyEvents.CenterAllWindows]: 'Center All Windows',
  [HotkeyEvents.OpenOrderTicket]: 'Open Order Ticket',
  [HotkeyEvents.OpenTradingDom]: 'Open Trading DOM',
  [HotkeyEvents.OpenChart]: 'Open New Chart',
  [HotkeyEvents.OpenConnections]: 'Open Connections Window',
  [HotkeyEvents.LockTrading]: 'Lock/Unlock Trading',
};

export interface SettingsComponent extends ILayoutNode {
}

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
@UntilDestroy()
@LayoutNode()
export class SettingsComponent implements OnInit {

  autoSaveSetting: number | string;
  isKeyboardRecording = false;
  keyboardListener = new SettingsKeyboardListener();
  currentEntery = null;

  saveDelayValues = {
    fiveMin: SAVE_DALEY.FIVE_MIN,
    manualSave: SAVE_DALEY.MANUAL_SAVE,
  };

  settings: SettingsData;
  hotkeysEvents = Object.values(HotkeyEvents);
  hotkeys: { name: string, key: string, binding: KeyBinding }[] = [];

  themes = [Themes.Dark, Themes.Light];

  tabs = ['general', 'hotkeys'];

  activeTab = 'general';


  get currentTheme() {
    return this.settings.theme as Themes;
  }

  set currentTheme(theme: Themes) {
    if (this.currentTheme !== theme)
      this._settingsService.changeTheme(theme);
  }

  constructor(
    public themesHandler: ThemesHandler,
    private _settingsService: SettingsService,
  ) {
    this.setTabTitle('Settings');
    this.setTabIcon('icon-setting-gear');
  }

  ngOnInit(): void {
    this._settingsService.settings
      .pipe(untilDestroyed(this))
      .subscribe(s => {
        this.settings = { ...s };
        this.updateHotkeys();
        if (s.autoSave && s.autoSaveDelay)
          this.autoSaveSetting = s.autoSaveDelay;
        else if (s.autoSave)
          this.autoSaveSetting = SAVE_DALEY.AUTO_SAVE;
        else
          this.autoSaveSetting = SAVE_DALEY.MANUAL_SAVE;
      });
  }

  updateHotkeys() {
    this.hotkeys = this.hotkeysEvents.map((key: string) => {
      const binding = this.settings.hotkeys[name] ? KeyBinding.fromDTO(this.settings.hotkeys[name])
        : new KeyBinding([]);
      return { name: hotkeyStringRepresentation[key], key, binding};
    });
  }

  switchAutoSave(delay: number): void {
    switch (delay) {
      case SAVE_DALEY.FIVE_MIN:
        this._settingsService.setAutoSave(SAVE_DALEY.FIVE_MIN);
        break;

      case SAVE_DALEY.MANUAL_SAVE:
      default:
        this._settingsService.removeAutoSave();
        break;
    }
  }

  handleNodeEvent(name: LayoutNodeEvent, data: any) {
    if (name === LayoutNodeEvent.Event) {
      if (this.isKeyboardRecording && data instanceof KeyboardEvent) {
        this.keyboardListener.handle(data);
        return true;
      }
    }
    return false;
  }

  updateHotkey(item: any, key) {
    this.settings.hotkeys[key] = item.toDTO();
    this._settingsService.saveKeyBinding(this.settings.hotkeys);
  }
}
