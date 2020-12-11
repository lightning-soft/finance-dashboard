import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ILayoutNode, LayoutNode } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { SettingsService } from './settings.service';
import { SettingsData } from './types';

export enum SAVE_DALEY {
  FIVE_MIN = 300000,
  AUTO_SAVE = 'AUTO_SAVE',
  MANUAL_SAVE = 'MANUAL_SAVE',
}

export interface SettingsComponent extends ILayoutNode { }
@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
@UntilDestroy()
@LayoutNode()
export class SettingsComponent implements OnInit {

  autoSaveSetting: number | string;

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
    this._settingService.changeTheme(theme);
  }

  constructor(
    public themeHandler: ThemesHandler,
    private _settingService: SettingsService,
  ) {
    this.setTabTitle('Settings');
    this.setTabIcon('icon-setting-gear');
  }

  ngOnInit(): void {
    this._settingService.settings
      .subscribe(s => {
        this.settings = { ...s };
        
        if (s.autoSave && s.autoSaveDelay)
          this.autoSaveSetting = s.autoSaveDelay
        else if (s.autoSave)
          this.autoSaveSetting = SAVE_DALEY.AUTO_SAVE
        else
          this.autoSaveSetting = SAVE_DALEY.MANUAL_SAVE
      });
  }

  switchAutoSave(delay: number): void {
    switch (delay) {
      case SAVE_DALEY.FIVE_MIN:
        this._settingService.setAutoSave(SAVE_DALEY.FIVE_MIN);
        break;

      case SAVE_DALEY.AUTO_SAVE:
        this._settingService.setAutoSave();
        break;

      case SAVE_DALEY.MANUAL_SAVE:
      default:
        this._settingService.removeAutoSave();
        break;
    }
  }

  changeHotke(event: Event, entery): void {
    /*
     * To-do
     *
    */
  }
}
