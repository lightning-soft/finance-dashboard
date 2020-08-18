import {Component, ViewChild, AfterViewInit, OnDestroy, EventEmitter} from '@angular/core';
import {LayoutComponent} from 'layout';
import {Components} from 'lazy-modules';
import {DragDrawerComponent} from './drag-drawer/drag-drawer.component';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {

  isDrawerOpen  = false;

  @ViewChild(LayoutComponent) layout: LayoutComponent;
  @ViewChild(DragDrawerComponent) drawer: DragDrawerComponent;


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
          // {
          //   type: 'component',
          //   componentName: Components.Chart
          // },
          // {
          //   type: 'component',
          //   componentName: Components.Chart
          // },
          {
            type: 'component',
            componentName: Components.Watchlist
          },
          // {
          //   type: 'component',
          //   componentName: Components.Positions
          // }
        ]
      },
    ]
  };

  ngAfterViewInit() {
    this.layout.loadState(this.settings).then(() => {
      this.drawer.initLayoutDragAndDrop(this.layout);
      this.layout.on('componentCreated', this.closeDrawer.bind(this));
    });
  }

  closeDrawer(){
   this.isDrawerOpen = false;
  }

  ngOnDestroy(): void {
    this.layout.off('componentCreated',
      this.closeDrawer.bind(this));
  }

  toggleDrawer(open) {
    this.isDrawerOpen = open;
  }
}
