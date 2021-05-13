import { Component, Input, Output, EventEmitter } from '@angular/core';
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
        minHeight: 300,
        minWidth: 369,
        height: 300,
        width: 369,
        resizable: false,
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
        width: 500,
        minWidth: 470,
      }
    },
  ];

const bottomWidgetList = [
  {
    icon: 'icon-clock',
    name: 'Session Manager',
    component: Components.SessionManager,
    options: {
      minWidth: 600,
    },
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
  @Output() handleToggleDropdown = new EventEmitter<boolean>();

  opened = false;
  items = widgetList;
  bottomItems = bottomWidgetList;

  create(item) {
    this.layout.addComponent({
      component: {
        name: item.component,
      },
      ...item.options
    });
  }

  handleDropdownToggle(opened: boolean): void {
    this.opened = opened;
    this.handleToggleDropdown.emit(opened);
  }
}
