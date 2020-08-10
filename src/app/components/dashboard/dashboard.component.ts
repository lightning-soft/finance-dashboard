import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { LayoutComponent } from 'layout';
import { Components } from 'lazy-modules';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild(LayoutComponent) layout;

  settings = {
    settings: {
      showPopoutIcon: false,
      showMaximiseIcon: true,
      responsiveMode: 'always'
    },
    dimensions: {
      headerHeight: 28.4,
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
          {
            type: 'component',
            componentName: Components.Watchlist
          },
          // {
          //   type: 'component',
          //   componentName: 'Orders'
          // }
        ]
      }]
  };

  ngAfterViewInit() {
    this.layout.loadState(this.settings);
  }
}
