import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SettingsKeyboardListener } from 'keyboard';
import { ILayoutNode, LayoutNode, LayoutNodeEvent } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { defaultHotkeyEntries, SettingsService } from './settings.service';
import { SettingsData } from './types';

export enum SAVE_DALEY {
  FIVE_MIN = 300000,
  AUTO_SAVE = 'AUTO_SAVE',
  MANUAL_SAVE = 'MANUAL_SAVE',
}

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
    autoSave: SAVE_DALEY.AUTO_SAVE,
    manualSave: SAVE_DALEY.MANUAL_SAVE,
  };

  settings: SettingsData;

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
        if (s.autoSave && s.autoSaveDelay)
          this.autoSaveSetting = s.autoSaveDelay;
        else if (s.autoSave)
          this.autoSaveSetting = SAVE_DALEY.AUTO_SAVE;
        else
          this.autoSaveSetting = SAVE_DALEY.MANUAL_SAVE;
      });
  }

  switchAutoSave(delay: number): void {
    switch (delay) {
      case SAVE_DALEY.FIVE_MIN:
        this._settingsService.setAutoSave(SAVE_DALEY.FIVE_MIN);
        break;

      case SAVE_DALEY.AUTO_SAVE:
        this._settingsService.setAutoSave();
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

  updateHotkey(item: any, index) {
    this.settings.hotkeys[index][1] = item;
    this._settingsService.saveKeyBinding(this.settings.hotkeys);
  }
}
