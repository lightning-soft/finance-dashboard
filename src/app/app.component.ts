import {AfterViewInit, Component, HostBinding, OnDestroy, ViewChild} from '@angular/core';
import {LayoutComponent} from './layout/layout.component';
import {HomeComponent} from './modules/general/home/home.component';
import {AboutComponent} from './modules/general/about/about.component';
import {ChartComponent} from './modules/general/chart/chart.component';
import {GoldenLayoutHandler} from './layout/goldenLayout.handler';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ThemeService} from './theme.service';


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
      closePopoutsOnUnload: true,
      showPopoutIcon: true,
      showMaximiseIcon: true,
      responsiveMode: 'always'
    },
    content: [
      {
        type: 'row',
        content: [{
          type: 'component',
          componentName: 'Chart'
        },
          {
            type: 'component',
            componentName: 'View'
          },
          {
            type: 'component',
            componentName: 'History'
          },
        ]
      }]
  };

  constructor(private layoutHandler: GoldenLayoutHandler,
             ) {
  }



  initLayout() {
    this.layout.registerComponent('Chart', ChartComponent);
    this.layout.registerComponent('View', AboutComponent);
    this.layout.registerComponent('History', HomeComponent);
    this.layout.init();

    this.layoutHandler.handleCreate.subscribe((name) => {
      this.layout.addComponent(name);
    });
  }


}
