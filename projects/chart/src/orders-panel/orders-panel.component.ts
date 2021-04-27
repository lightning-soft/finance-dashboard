import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { ILayoutNode, LayoutNode } from 'layout';
import { CellClickDataGridHandler, CheckboxCell } from 'data-grid';
import { convertToColumn, HeaderItem } from 'base-components';
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

  readonly headers: HeaderItem[] = [
    {
      name: 'chechbox',
      title: '',
      width: 30,
      draw: this.headerCheckboxCell.draw.bind(this.headerCheckboxCell),
      canHide: false
    },
    'type',
    'side',
    'symbol',
    'exchange',
    { name: 'duration', title: 'TIF' },
    { name: 'averageFillPrice', title: 'Price' },
    { name: 'moveDown', title: '' },
    { name: 'moveUp', title: '' },
    { name: 'quantity', title: 'WRK Qty' },
    { name: 'stop', title: '' },
    { name: 'play', title: '' },
    { name: 'close', title: '', canHide: false },
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
    this.columns = this.headers.map((item) => {
      return convertToColumn(item, {
        buyColor: 'rgba(72, 149, 245, 1)',
        sellColor: 'rgba(220, 50, 47, 1)',
        textOverflow: true,
        textAlign: 'left',
      })
    })
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
