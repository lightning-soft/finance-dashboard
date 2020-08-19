import { BehaviorSubject } from "rxjs";

export enum Themes {
  Dark = 'dark',
  Light = 'light',
}

export class ThemesHandler {
  private _theme$ = new BehaviorSubject<Themes>(Themes.Dark);

  themeChange$ = this._theme$.asObservable();

  get theme() {
    return this._theme$.value;
  }

  changeTheme(theme: Themes) {
    this._theme$.next(theme);
  }
}
