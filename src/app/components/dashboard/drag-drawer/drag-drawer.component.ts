import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { Components } from '../../../modules';

export const widgetList = [
    {
      icon: 'icon-widget-chart',
      name: 'Chart',
      component: Components.Chart
    },
    {
      icon: 'icon-widget-positions',
      name: 'Positions',
      component: Components.Positions,
      options: {
        minWidth: 384,
      }
    },
    {
      icon: 'icon-widget-orders',
      name: 'Orders',
      component: Components.Orders
    },
    {
      icon: 'icon-widget-create-orders',
      name: 'Add orders',
      component: Components.OrderForm,
      options: {
        minHeight: 315,
        minWidth: 369,
        height: 315,
        width: 369,
        maximizable: false,
      }
    },
    /*    {
          icon: 'icon-widget-market-watch',
          name: 'Market Watch',
        },*/
    {
      icon: 'icon-widget-watchlist',
      name: 'Watchlist',
      component: Components.Watchlist
    },
    {
      icon: 'icon-widget-dom',
      name: 'DOM',
      component: Components.Dom,
      options: {
        minWidth: 1200,
      }
    },
    // {
    //   icon: 'icon-scripting',
    //   name: 'Scripting',
    //   component: Components.Scripting
    // }
  ];

@UntilDestroy()
@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent {
  @Input() layout: LayoutComponent;
  opened = false;

  items = widgetList;

  create(item) {
    this.layout.addComponent({
      component: {
        name: item.component,
      },
      ...item.options
    });
  }
}
