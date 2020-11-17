import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { SettingsStore } from './setting-store';
import { HotkeyEntrie, SettingsData } from './types';

const defaultHotkeyEntries: HotkeyEntrie[] = [
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
export class SettignsService {

  private _layout: LayoutComponent = (window as any).LayoutComponent;

  private _autoSaveIntervalId: number;

  private _settings: SettingsData = defaultSettings;

  get settings(): SettingsData {
    return { ...this._settings };
  }

  constructor(
    public themeHandler: ThemesHandler,
    private settingStore: SettingsStore,
  ) {
    this.settingStore
      .getItem()
      .subscribe((settings: SettingsData) => {
        if (!settings) return;

        if (settings.autoSave)
          this.setAutoSave(settings.autoSaveDelay);

        if (settings.theme)
          this.changeTheme(settings.theme);
      });
   }

  setAutoSave(delay: number): void {

    if (this._autoSaveIntervalId)
      clearInterval(this._autoSaveIntervalId);

    this._autoSaveIntervalId = setInterval(() => {
      this._layout.saveState();
      this.saveState();
    }, delay);

    this.updateState({ autoSave: true, autoSaveDelay: delay });
  }

  removeAutoSave(): void {
    if (this._autoSaveIntervalId)
      clearInterval(this._autoSaveIntervalId);

    this.updateState({ autoSave: false, autoSaveDelay: null });
  }

  changeTheme(theme): void {
    this.themeHandler.changeTheme(theme);
    this.updateState({ theme });
  }

  private saveState(): void {
    this.settingStore.setItem(this.settings);
  }

  private updateState(settings: object): void {
    this._settings = { ...this.settings, ...settings };
    this.saveState();
  }
}
