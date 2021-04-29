import { IViewItem } from 'base-components';
import { Id } from 'communication';
import { DataCell, IconCell, CheckboxCell, Column, Cell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';
import { TextAlign } from 'dynamic-form';

const allFields: Partial<keyof OrderItem>[] = [
  'checkbox',
  'accountId',
  'averageFillPrice',
  'description',
  'duration',
  'filledQuantity',
  'quantity',
  'quantityRemain',
  'side',
  'status',
  'type',
  'exchange',
  'symbol',
  'fcmId',
  'ibId',
  'identifier',
  'close',
];

export class OrderItem implements IViewItem<IOrder> {
  accountId = new DataCell({ withHoverStatus: true });
  exchange = new DataCell({ withHoverStatus: true });
  symbol = new DataCell({ withHoverStatus: true });
  fcmId = new DataCell({ withHoverStatus: true });
  identifier = new DataCell({ withHoverStatus: true });
  ibId = new DataCell({ withHoverStatus: true });
  averageFillPrice = new DataCell({ withHoverStatus: true });
  description = new DataCell({ withHoverStatus: true });
  duration = new DataCell({ withHoverStatus: true });
  filledQuantity = new DataCell({ withHoverStatus: true });
  quantityRemain = new DataCell({ withHoverStatus: true });
  quantity = new DataCell({ withHoverStatus: true });
  side = new DataCell({ withHoverStatus: true });
  status = new DataCell({ withHoverStatus: true });
  type = new DataCell({ withHoverStatus: true });
  close = new IconCell({ withHoverStatus: true });
  checkbox = new CheckboxCell({ withHoverStatus: true });
  order: IOrder;

  private _hovered: boolean = false;

  get id(): Id {
    return this.order.id;
  }

  get isSelected(): boolean {
    return this.checkbox.checked;
  }

  set hovered(value: boolean) {
    this._hovered = value;

    allFields.forEach((field) => {
      const cell: Cell = this[field] as Cell;
      if (cell) {
        cell.hovered = this._hovered;
      }
    });
  }

  get hovered() {
    return this._hovered;
  }

  constructor(order: IOrder) {
    this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };

    ['averageFillPrice', 'description', 'duration', 'filledQuantity', 'quantity', 'side', 'status', 'type']
      .forEach((item) => {
        this[item]?.updateValue(order[item]);
      });

    this.accountId.updateValue(order.account.id);
    this.quantityRemain.updateValue(order.quantity - order.filledQuantity);

    ['exchange', 'symbol']
      .forEach((item) => {
        this[item].updateValue(order.instrument[item]);
      });

    ['fcmId', 'ibId']
      .forEach((item) => {
        this[item].updateValue(order.account[item]);
      });

    this.changeStatus();
    this.identifier.updateValue(order.id);

    this.side.class = order.side === OrderSide.Buy ? PriceStatus.Up : PriceStatus.Down;
  }

  changeStatus() {
    ['averageFillPrice', 'description', 'quantityRemain', 'duration', 'accountId', 'filledQuantity', 'quantity', 'side', 'status', 'type', 'exchange', 'symbol', 'fcmId', 'ibId', 'identifier']
      .forEach((item) => {
        this[item]?.changeStatus(this.side.value.toLowerCase());
      });
  }

  toggleSelect(event: MouseEvent): void {
    this.checkbox.toggleSelect(event);
    this._updateSelectedStatus();
  }

  updateSelect(selected: boolean): void {
    this.checkbox.updateValue(selected);
    this._updateSelectedStatus();
  }

  private _updateSelectedStatus(): void {
    const selectedStatusName = this.isSelected ? 'selected' : '';
    allFields.forEach(field => (this[field] as Cell).setStatusPrefix(selectedStatusName));
  }

  changeCheckboxHorizontalAlign(align: TextAlign): void {
    this.checkbox.horizontalAlign = align;
  }
}
