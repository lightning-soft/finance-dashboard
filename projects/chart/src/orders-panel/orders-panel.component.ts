import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { ILayoutNode, LayoutNode } from 'layout';
import { CellClickDataGridHandler, CheckboxCell, Column } from 'data-grid';
import { convertToColumn, StringHelper } from 'base-components';
import { CustomOrderItem } from './custom-order.item';
import { OrderItem } from 'base-order-form';

export interface OrdersPanelComponent extends ILayoutNode {
}

@Component({
  selector: 'orders-panel',
  templateUrl: './orders-panel.component.html',
  styleUrls: ['./orders-panel.component.scss']
})
@LayoutNode()
export class OrdersPanelComponent implements OnInit {
  columns = [];
  @HostBinding('tabindex') tabindex = 0;
  selectedItemsCount = 0;
  items = [];
  orders = [];
  headerCheckboxCell = new CheckboxCell();

  readonly headers = [
    ['checkbox', ' ', { width: 30, drawObject: this.headerCheckboxCell }],
    'type',
    'side',
    'symbol',
    'exchange',
    ['duration', 'TIF'],
    ['averageFillPrice', 'Price'],
    ['moveDown', ''],
    ['moveUp', ''],
    ['quantity', 'WRK Qty'],
    ['stop', ''],
    ['play', ''],
    ['close', ''],
  ];
  handlers = [
    new CellClickDataGridHandler<OrderItem>({
      column: 'checkbox',
      handleHeaderClick: true,
      handler: (item, event) => {
        item ? item.toggleSelect(event) : this.handleHeaderCheckboxClick(event);
      },
    })
  ];

  ngOnInit(): void {
    this.columns = this.headers.map((nameOrArr: any) => {
      nameOrArr = Array.isArray(nameOrArr) ? nameOrArr : ([nameOrArr, nameOrArr, {}]);
      const [name, title, options] = nameOrArr;

      const column: Column = {
        name,
        title: title.toUpperCase(),
        tableViewName: StringHelper.capitalize(name),
        style: {
          ...options?.style,
          buyColor: 'rgba(72, 149, 245, 1)',
          sellColor: 'rgba(220, 50, 47, 1)',
          textOverflow: true,
          textAlign: 'left',
        },
        visible: true,
        width: options?.width
      };

      if (options?.drawObject) {
        column.draw = (context) => options.drawObject.draw(context);
      }

      return column;
    });
  }

  handleHeaderCheckboxClick(event: MouseEvent): void {
    if (this.headerCheckboxCell.toggleSelect(event)) {
      this.items.forEach(item => item.updateSelect(this.headerCheckboxCell.checked));
    }
    this.selectedItemsCount = this.items.filter(item => item.isSelected).length;
  }

  loadState(state) {
    this.orders = state?.orders || [];
    this._buildItems();
  }

  private _buildItems() {
    this.items = this.orders.map(item => new CustomOrderItem(item));
  }

  saveState() {
    return {
      orders: this.orders,
    };
  }

  @HostListener('blur')
  leavePage() {
    this.layoutContainer.close();
  }
}
