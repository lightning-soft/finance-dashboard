import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {LayoutComponent} from 'layout';
import {Components} from 'lazy-modules';
import {NavigationDrawerService} from './navigation-drawer.service';
import {DragDrawerComponent} from './drag-drawer/drag-drawer.component';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [NavigationDrawerService]
})
export class DashboardComponent implements AfterViewInit {


  @ViewChild(LayoutComponent) layout: LayoutComponent;
  @ViewChild(DragDrawerComponent) drawer: DragDrawerComponent;

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
  val = 'val';

  ngAfterViewInit() {
    this.layout.loadState(this.settings).then(() => {
      this.drawer.initLayoutDragAndDrop(this.layout);
    });
  }


}
