import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { convertToColumn, HeaderItem } from 'base-components';
import { OrderItem } from 'base-order-form';
import { CellClickDataGridHandler, CheckboxCell } from 'data-grid';
import { ILayoutNode, LayoutNode } from 'layout';
import { NzModalService } from 'ng-zorro-antd';
import { NotifierService } from 'notifier';
import { Components } from 'src/app/modules';
import { IBaseTemplate, IPresets, LayoutPresets, TemplatesService } from 'templates';
import { CustomOrderItem } from './custom-order.item';


export interface IOrderPanelState {
  orders: any[]
}

export type IOrderPanelPresets = IBaseTemplate<IOrderPanelState>;

export interface OrdersPanelComponent extends ILayoutNode, IPresets<IOrderPanelState> {
}

@Component({
  selector: 'orders-panel',
  templateUrl: './orders-panel.component.html',
  styleUrls: ['./orders-panel.component.scss']
})
@LayoutNode()
@LayoutPresets()
export class OrdersPanelComponent implements OnInit {
  columns = [];
  @HostBinding('tabindex') tabindex = 0;
  selectedItemsCount = 0;
  items = [];
  orders = [];
  headerCheckboxCell = new CheckboxCell();

  Components = Components;

  readonly headers: HeaderItem[] = [
    {
      name: 'checkbox',
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
      handler: (data, event) => {
        data.item ? data.item.toggleSelect(event) : this.handleHeaderCheckboxClick(event);
      },
    })
  ];

  constructor(
    public readonly _templatesService: TemplatesService,
    public readonly _modalService: NzModalService,
    public readonly _notifier: NotifierService,
  ) { }

  ngOnInit(): void {
    this.columns = this.headers.map((item) => {
      return convertToColumn(item, {
        buyColor: 'rgba(72, 149, 245, 1)',
        sellColor: 'rgba(220, 50, 47, 1)',
        textOverflow: true,
        textAlign: 'left',
      });
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

  save(): void {
    const presets: IOrderPanelPresets = {
      id: this.loadedPresets?.id,
      name: this.loadedPresets?.name,
      type: Components.OrdersPanel
    };

    this.savePresets(presets);
  }
}
