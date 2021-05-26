import { IViewItem } from 'base-components';
import { Id } from 'communication';
import {
  Cell,
  CellStatus,

  CheckboxCell,
  DataCell,
  HoverableItem,
  IconCell, NumberCell,
  RoundFormatter
} from 'data-grid';
import { TextAlign } from 'dynamic-form';
import { IOrder, OrderSide } from 'trading';
import { PriceStatus } from 'trading-ui';

export enum OrderColumn {
  checkbox = 'checkbox',
  accountId = 'accountId',
  averageFillPrice = 'averageFillPrice',
  price = 'price',
  triggerPrice = 'triggerPrice',
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
  private _priceFormatter = new RoundFormatter(this.order.instrument.precision ?? 2);

  accountId = new DataCell({ withHoverStatus: true });
  exchange = new DataCell({ withHoverStatus: true });
  symbol = new DataCell({ withHoverStatus: true });
  fcmId = new DataCell({ withHoverStatus: true });
  identifier = new DataCell({ withHoverStatus: true });
  ibId = new DataCell({ withHoverStatus: true });
  price = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  triggerPrice = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  averageFillPrice = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
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

  get id(): Id {
    return this.order.id;
  }

  get isSelected(): boolean {
    return this.checkbox.checked;
  }

  constructor(public order: IOrder) {
    super();
    this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };
    [
      OrderColumn.averageFillPrice,
      OrderColumn.price,
      OrderColumn.triggerPrice,
      OrderColumn.description,
      OrderColumn.duration,
      OrderColumn.filledQuantity,
      OrderColumn.quantity,
      OrderColumn.side,
      OrderColumn.status,
      OrderColumn.type
    ]
      .forEach((item) => {
        (<DataCell | NumberCell>this[item]).updateValue(order[item]);
      });

    this.accountId.updateValue(order.account.id);
    this.quantityRemain.updateValue(order.quantity - order.filledQuantity);

    [OrderColumn.exchange, OrderColumn.symbol]
      .forEach((item) => {
        (<DataCell>this[item]).updateValue(order.instrument[item]);
      });

    [OrderColumn.fcmId, OrderColumn.ibId]
      .forEach((item) => {
        (<DataCell>this[item]).updateValue(order.account[item]);
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

  protected _getPropertiesForHover(): string[] {
    return allColumns;
  }
}
