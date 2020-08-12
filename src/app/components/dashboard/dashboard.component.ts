import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {LayoutComponent} from 'layout';
import {Components} from 'lazy-modules';
import {NavigationDrawerService} from './navigation-drawer.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [NavigationDrawerService]
})
export class DashboardComponent implements AfterViewInit {

  isOpen$ = this.navigationDrawerService.isOpen$;

  @ViewChild(LayoutComponent) layout: LayoutComponent;
  @ViewChild('addChart') addChart;
  @ViewChild('addWatch') addWatch;

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
  constructor(private navigationDrawerService: NavigationDrawerService) {
  }
  ngAfterViewInit() {
    this.layout.loadState(this.settings).then(() => {

      this.layout.createDragSource(this.addChart.nativeElement,
        {
          title: 'chart',
          type: 'component',
          componentName: 'chart',
        });

      this.layout.createDragSource(this.addWatch.nativeElement,
        {
          title: 'watchlist',
          type: 'component',
          componentName: 'watchlist',
        });
    });
  }


}
