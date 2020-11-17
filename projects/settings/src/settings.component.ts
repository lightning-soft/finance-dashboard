import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutNode } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { SettignsService } from './settings.service';
import { SettingsData } from './types';

const FIVE_MIN = 300000;
@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
@UntilDestroy()
@LayoutNode()
export class SettingsComponent implements OnInit {

  settings: SettingsData;

  themes = [Themes.Dark, Themes.Light];

  tabs = ['general', 'hotkeys'];

  activeTab = 'general';

  get currentTheme() {
    return this.settings.theme as Themes;
  }

  set currentTheme(theme: Themes) {
    this.settingService.changeTheme(theme);
  }

  constructor(
    public themeHandler: ThemesHandler,
    private settingService: SettignsService,
  ) { }

  ngOnInit(): void {
    this.settings = this.settingService.settings;
  }

  toggleAutoSave(isAutoSave: boolean): void {
    if (isAutoSave)
      this.settingService.setAutoSave(FIVE_MIN);
    else
      this.settingService.removeAutoSave();
  }

  changeHotke(event: Event, entery): void {
    /*
     * To-do
     *
    */
  }
}
