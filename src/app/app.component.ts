import {  Component, ViewChild } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { OrdersComponent } from './modules/general/orders/orders.component';
import { WatchComponent } from './modules/general/watch/watch.component';
import { ChartComponent } from './modules/general/chart/chart.component';
import { GoldenLayoutHandler } from './layout/goldenLayout.handler';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('container') container;
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
    },
    content: [
      {
        type: 'row',
        content: [
          {
            type: 'component',
            componentName: 'Chart'
          },
          {
            type: 'component',
            componentName: 'Watch'
          },
          {
            type: 'component',
            componentName: 'Orders'
          },
        ]
      }]
  };

  constructor(private layoutHandler: GoldenLayoutHandler,
  ) {
  }



  initLayout() {
    this.layout.registerComponent('Chart', ChartComponent);
    this.layout.registerComponent('Watch', WatchComponent);
    this.layout.registerComponent('Orders', OrdersComponent);
    this.layout.init();

    this.layoutHandler.handleCreate.subscribe((name) => {
      this.layout.addComponent(name);
    });
  }


}
