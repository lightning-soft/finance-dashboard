import { Component } from '@angular/core';
import { LayoutNode } from 'layout';
import { Themes, ThemesHandler } from 'themes';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';


@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
@UntilDestroy()
@LayoutNode()
export class SettingsComponent {
  themes = [Themes.Dark, Themes.Light];

  private _currentTheme;

  get currentTheme() {
    return this._currentTheme;
  }

  set currentTheme(value: Themes) {
    this.themeHandler.changeTheme(value);
    this._currentTheme = value;
  }

  constructor(public themeHandler: ThemesHandler) {
    themeHandler.themeChange$
      .pipe(untilDestroyed(this))
      .subscribe((theme) => {
        this._currentTheme = theme;
      });
  }
}
