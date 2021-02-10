import { Component, Input } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { LayoutComponent } from 'layout';
import { Components } from '../../../modules';

@UntilDestroy()
@Component({
  selector: 'app-drag-drawer',
  templateUrl: './drag-drawer.component.html',
  styleUrls: ['./drag-drawer.component.scss']
})
export class DragDrawerComponent {
  @Input() layout: LayoutComponent;

  items = [
    {
      icon: 'icon-widget-chart',
      name: 'Chart',
      component: Components.Chart
    },
    {
      icon: 'icon-widget-positions',
      name: 'Positions',
      component: Components.Positions
    },
    {
      icon: 'icon-widget-orders',
      name: 'Orders',
      component: Components.Orders
    },
    {
      icon: 'icon-widget-create-orders',
      name: 'Add orders',
      component:  Components.OrderForm,
      options: {
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
      component: Components.Dom
    },
    // {
    //   icon: 'icon-orders',
    //   name: 'Order form',
    //   component: Components.OrderForm
    // },
    // {
    //   icon: 'icon-scripting',
    //   name: 'Scripting',
    //   component: Components.Scripting
    // }
  ];

  create(item) {
    this.layout.addComponent({
      component: {
        name: item.component,
      },
      ...item.options
    });
  }
}
