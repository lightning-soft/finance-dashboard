import { Injectable } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { KeyBinding, KeyBindingPart, KeyCode } from 'keyboard';
import { BehaviorSubject } from 'rxjs';
import { Themes, ThemesHandler } from 'themes';
import { SettingsStore } from './setting-store';
import { HotkeyEntire, ICommand, SettingsData } from './types';
import { Workspace } from 'workspace-manager';

function createCommand(name: string, uiSstring: string = name): ICommand {
  return {
    name,
    UIString: uiSstring
  }
}

export const defaultHotkeyEntries: HotkeyEntire[] = [
  [createCommand('save_page', 'Save page'), new KeyBinding([KeyBindingPart.fromKeyCode(KeyCode.Ctrl), KeyBindingPart.fromKeyCode(KeyCode.KEY_S)])],
  [createCommand('Copy'), new KeyBinding([KeyBindingPart.fromKeyCode(KeyCode.Ctrl), KeyBindingPart.fromKeyCode(KeyCode.KEY_C)])],
  [createCommand('Paste'), new KeyBinding([KeyBindingPart.fromKeyCode(KeyCode.Ctrl), KeyBindingPart.fromKeyCode(KeyCode.KEY_P)])],
  [createCommand('Cut'), new KeyBinding([KeyBindingPart.fromKeyCode(KeyCode.Ctrl), KeyBindingPart.fromKeyCode(KeyCode.KEY_X)])],
];

const defaultSettings = {
  theme: Themes.Dark,
  autoSave: false,
  autoSaveDelay: null,
  language: 'English',
  hotkeys: defaultHotkeyEntries,
  tradingEnabled: true,
  workspaces: [],
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
        (s) => s && this._updateState(s, false),
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

  updateTradingLock(tradingEnabled: boolean) {
    this._updateState({tradingEnabled});
  }

  saveState(): void {
    this._settingStore.setItem(this.settings.value).toPromise();
  }

  saveKeyBinding(hotkeys: HotkeyEntire[]) {
     this._updateState({ hotkeys });
  }
  saveWorkspaces(workspaces: Workspace[]){
    this._updateState({ workspaces });
  }

  private _updateState(settings: object, saveInStorage = true): void {
    this.settings.next({ ...this.settings.value, ...settings });
    if (saveInStorage)
      this.saveState();
  }
}
