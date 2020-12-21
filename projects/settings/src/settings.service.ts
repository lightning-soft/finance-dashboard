import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { Themes, ThemesHandler } from 'themes';
import { SettingsStore } from './setting-store';
import { HotkeyEntire, SettingsData } from './types';

const defaultHotkeyEntries: HotkeyEntire[] = [
  ['Save page', 'Ctrl + S'],
  ['Copy', 'Ctrl + C'],
  ['Paste', 'Ctrl + V'],
  ['Cut', 'Ctrl + X'],
];

const defaultSettings = {
  theme: Themes.Dark,
  autoSave: false,
  autoSaveDelay: null,
  language: 'English',
  hotkeys: defaultHotkeyEntries,
};

@Injectable()
@UntilDestroy()
export class SettingsService {

  settings: BehaviorSubject<SettingsData> = new BehaviorSubject(defaultSettings);

  constructor(
    public themeHandler: ThemesHandler,
    private _settingStore: SettingsStore,
  ) {
    this._init();
  }

  private _init(): void {
    this._settingStore
      .getItem()
      .subscribe(
        (s) => s && this._updateState(s),
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
    this.themeHandler.changeTheme(theme);
    this._updateState({ theme });
  }

  saveState(): void {
    this._settingStore.setItem(this.settings.value);
  }

  private _updateState(settings: object): void {
    this.settings.next({ ...this.settings.value, ...settings });
    this.saveState();
  }
}
