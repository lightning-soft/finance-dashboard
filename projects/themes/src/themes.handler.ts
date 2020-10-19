import { Injectable } from '@angular/core';
import { GlobalHandlerService, IMessage } from 'global-handler';
import { BehaviorSubject } from 'rxjs';

export const CHANGE_THEME = 'CHANGE_THEME';

export enum Themes {
  Dark = 'dark',
  Light = 'light',
}
@Injectable()
export class ThemesHandler {
  private _theme$ = new BehaviorSubject<Themes>(Themes.Dark);

  themeChange$ = this._theme$.asObservable();

  constructor(private _globalHandlerService: GlobalHandlerService) {
    this._globalHandlerService.on(CHANGE_THEME, (msg) => {
      const { data } = msg;
      this.changeTheme(data as Themes);
    });
  }

  get theme() {
    return this._theme$.value;
  }

  toggleTheme() {
    const theme = this.theme === Themes.Dark ? Themes.Light : Themes.Dark;

    this.changeTheme(theme);
  }

  changeTheme(theme: Themes) {
    this._theme$.next(theme);

    const msg: IMessage = {
      sender: 'window',
      eventType: CHANGE_THEME,
      data: theme,
    };

    this._globalHandlerService.emit(msg);
  }
}
