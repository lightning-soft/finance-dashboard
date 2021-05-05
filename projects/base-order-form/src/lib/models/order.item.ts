import { IViewItem, HoverableItem } from 'base-components';
import { Id } from 'communication';
import { Cell, CellStatus, CellStatusGetter, CheckboxCell, DataCell, IconCell } from 'data-grid';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';
import { TextAlign } from 'dynamic-form';

export enum OrderColumn {
  checkbox = 'checkbox',
  accountId = 'accountId',
  averageFillPrice = 'averageFillPrice',
  description = 'description',
  duration = 'duration',
  filledQuantity = 'filledQuantity',
  quantity = 'quantity',
  quantityRemain = 'quantityRemain',
  side = 'side',
  status = 'status',
  type = 'type',
  exchange = 'exchange',
  symbol = 'symbol',
  fcmId = 'fcmId',
  ibId = 'ibId',
  identifier = 'identifier',
  close = 'close',
}

type IOrderItem = IViewItem<IOrder> & {
  [key in OrderColumn]: Cell;
}

const allColumns = Object.keys(OrderColumn) as OrderColumn[];

export class OrderItem extends HoverableItem implements IOrderItem {
  accountId = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  exchange = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  symbol = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  fcmId = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  identifier = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  ibId = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  averageFillPrice = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  description = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  duration = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  filledQuantity = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  quantityRemain = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  quantity = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  side = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  status = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  type = new DataCell({ withHoverStatus: true, getStatusByStyleProp });
  close = new IconCell({ withHoverStatus: true, getStatusByStyleProp });
  checkbox = new CheckboxCell({ withHoverStatus: true, getStatusByStyleProp });
  order: IOrder;

  get id(): Id {
    return this.order.id;
  }

  get isSelected(): boolean {
    return this.checkbox.checked;
  }

  constructor(order: IOrder) {
    super();
    this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };
    [
      OrderColumn.averageFillPrice,
      OrderColumn.description,
      OrderColumn.duration,
      OrderColumn.filledQuantity,
      OrderColumn.quantity,
      OrderColumn.side,
      OrderColumn.status,
      OrderColumn.type
    ]
      .forEach((item) => {
        this[item]?.updateValue(order[item]);
      });

    this.accountId.updateValue(order.account.id);
    this.quantityRemain.updateValue(order.quantity - order.filledQuantity);

    [OrderColumn.exchange, OrderColumn.symbol]
      .forEach((item) => {
        this[item].updateValue(order.instrument[item]);
      });

    [OrderColumn.fcmId, OrderColumn.ibId]
      .forEach((item) => {
        this[item].updateValue(order.account[item]);
      });

    this.changeStatus();
    this.identifier.updateValue(order.id);

    this.side.class = order.side === OrderSide.Buy ? PriceStatus.Up : PriceStatus.Down;
  }

  changeStatus() {
    allColumns.forEach((item) => {
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
    const selectedStatusName = this.isSelected ? CellStatus.Selected : CellStatus.None;
    allColumns.forEach(field => (this[field] as Cell).setStatusPrefix(selectedStatusName));
  }

  changeCheckboxHorizontalAlign(align: TextAlign): void {
    this.checkbox.horizontalAlign = align;
  }

  protected _getCellsToHover(): Cell[] {
    return allColumns.map((field) => this[field]);
  }
}

const getStatusByStyleProp: CellStatusGetter = (cell, style) => {
  if (cell.hovered && cell.hoverStatusEnabled && style === 'BackgroundColor') {
    return CellStatus.Hovered;
  }

  return cell.status;
}
