import { IViewItem } from 'base-components';
import { Id } from 'communication';
import {
  Cell,
  CellStatus,
  CheckboxCell,
  DataCell,
  HoverableItem,
  IconCell,
  NumberCell,
  RoundFormatter
} from 'data-grid';
import { TextAlign } from 'dynamic-form';
import { IOrder, OrderSide, OrderStatus } from 'trading';
import { PriceStatus } from 'trading-ui';

export enum OrderColumn {
  checkbox = 'checkbox',
  accountId = 'accountId',
  averageFillPrice = 'averageFillPrice',
  price = 'price',
  triggerPrice = 'triggerPrice',
  currentPrice = 'currentPrice',
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

export const OrderColumnsArray = Object.values(OrderColumn);

export const heldPrefixStatus = 'held';
export const StopSelectedStatus = `selected${ heldPrefixStatus }`;

type IOrderItem = IViewItem<IOrder> & {
  [key in OrderColumn]: Cell;
};

const allColumns = Object.keys(OrderColumn) as OrderColumn[];

export class OrderItem extends HoverableItem implements IOrderItem {
  protected _priceFormatter = new RoundFormatter(this.order?.instrument.precision ?? 2);

  accountId = new DataCell({ withHoverStatus: true });
  exchange = new DataCell({ withHoverStatus: true });
  symbol = new DataCell({ withHoverStatus: true });
  fcmId = new DataCell({ withHoverStatus: true });
  identifier = new DataCell({ withHoverStatus: true });
  ibId = new DataCell({ withHoverStatus: true });
  price = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  triggerPrice = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  currentPrice = new NumberCell({ withHoverStatus: true });
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

  constructor(public order?: IOrder) {
    super();
    if (order)
      this.update(order);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };
    this._priceFormatter.updateDigits(this.order.instrument.precision ?? 2);
    this.price.formatter = this._priceFormatter;
    this.triggerPrice.formatter = this._priceFormatter;
    this.averageFillPrice.formatter = this._priceFormatter;
    this.currentPrice.formatter = this._priceFormatter;

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

  changeStatus(): void {
    allColumns.forEach((item) => this._updateCellStatus(this[item]));
  }

  toggleSelect(event: MouseEvent): void {
    this.checkbox.toggleSelect(event);
    this._updateSelectedStatus();
  }

  updateSelect(selected: boolean): void {
    this.checkbox.updateValue(selected);
    this._updateSelectedStatus();
  }

  private _updateCellStatus(cell: Cell): void {
    if (this.order.status === OrderStatus.Stopped)
      cell.setStatusPrefix(heldPrefixStatus);

    cell.changeStatus(this.side.value.toLowerCase());
  }

  private _updateSelectedStatus(): void {
    const selectedStatusName = this.getSelectedStatus();
    allColumns.forEach(field => (this[field] as Cell).setStatusPrefix(selectedStatusName));
  }

  private getSelectedStatus() {
    if (this.order.status === OrderStatus.Stopped)
      return this.isSelected ? StopSelectedStatus : heldPrefixStatus;

    return this.isSelected ? CellStatus.Selected : CellStatus.None;
  }

  changeCheckboxHorizontalAlign(align: TextAlign): void {
    this.checkbox.horizontalAlign = align;
  }

  setCurrentPrice(price: number): void {
    this.currentPrice.updateValue(price);
    this._updateCellStatus(this.currentPrice);
  }

  protected _getPropertiesForHover(): string[] {
    return allColumns;
  }
}
