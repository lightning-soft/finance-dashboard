import { Component, ViewChild } from '@angular/core';
import { LayoutComponent } from '../../layout/layout.component';
import { GoldenLayoutHandler } from '../../layout/goldenLayout.handler';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
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
          }
        ]
      }]
  };

  constructor(private layoutHandler: GoldenLayoutHandler) {
  }

  initLayout() {
    this.layout.init();

    this.layoutHandler.handleCreate.subscribe((name) => {
      this.layout.addComponent(name);
    });
  }


}
