import { AfterViewInit, Component, ViewChild, forwardRef } from '@angular/core';
import { LayoutComponent } from 'layout';
import { Components } from 'lazy-modules';
import { ThemesHandler, Themes } from 'themes';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild(LayoutComponent) layout: LayoutComponent;


  constructor(private _themesHandler: ThemesHandler) { }

  ngAfterViewInit() {
    this.layout.loadState();

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass();
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
  }
}
