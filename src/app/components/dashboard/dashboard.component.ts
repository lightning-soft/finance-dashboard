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

  settings = {
    settings: {
      showPopoutIcon: false,
      showMaximiseIcon: true,
      responsiveMode: 'always'
    },
    dimensions: {
      headerHeight: 30,
      borderWidth: 15,
      minItemWidth: 210,
    },
    content: [
      {
        type: 'row',
        content: [
          {
            type: 'component',
            componentName: Components.Chart
          },
          // {
          //   type: 'component',
          //   componentName: Components.Chart
          // },
         /* {
            type: 'component',
            componentName: Components.Watchlist
          },*/
          {
            type: 'component',
            componentName: Components.Orders
          },
          /*{
            type: 'component',
            componentName: Components.OrderForm
          }*/
        ]
      },
    ]
  };

  constructor(private _themesHandler: ThemesHandler) { }

  ngAfterViewInit() {
    this.layout.loadState(this.settings);

    this._themesHandler.themeChange$.subscribe((theme) => {
      $('body').removeClass();
      $('body').addClass(theme === Themes.Light ? 'scxThemeLight' : 'scxThemeDark');
    });
  }
}
