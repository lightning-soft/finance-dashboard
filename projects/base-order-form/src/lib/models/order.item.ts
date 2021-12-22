import { IViewItem } from 'base-components';
import { Id } from 'communication';
import { Cell, CellStatus, CheckboxCell, DataCell, DateCell, HoverableItem, IconCell, NumberCell, } from 'data-grid';
import { TextAlign } from 'dynamic-form';
import { IOrder, OrderSide, OrderStatus } from 'trading';
import { PriceStatus } from 'trading-ui';
import { DateTimeFormatter } from '../../../../data-grid/src/models/formatters/date-time.formatter';
import { InstrumentFormatter } from '../../../../data-grid/src/models/formatters/instrument.formatter';

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
  timestamp = 'timestamp',
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
export const inactivePrefixStatus = 'inactive';
const excludedStatuses = [OrderStatus.Stopped, OrderStatus.Pending, OrderStatus.New];

type IOrderItem = IViewItem<IOrder> & {
  [key in OrderColumn]: Cell;
};

const allColumns = Object.keys(OrderColumn) as OrderColumn[];

export function complexInstrumentId(instrumentId: Id, accountId: Id) {
  return `${instrumentId}.${accountId}`;
}

export class OrderItem extends HoverableItem implements IOrderItem {
  highlightOnlyActive = false;
  protected _priceFormatter = InstrumentFormatter.forInstrument(this.order?.instrument);

  set timeFormatter(formatter: DateTimeFormatter) {
    this.timestamp.formatter = formatter;
  }

  accountId = new DataCell({ withHoverStatus: true });
  exchange = new DataCell({ withHoverStatus: true });
  symbol = new DataCell({ withHoverStatus: true });
  fcmId = new DataCell({ withHoverStatus: true });
  identifier = new DataCell({ withHoverStatus: true });
  ibId = new DataCell({ withHoverStatus: true });
  timestamp = new DateCell({ withHoverStatus: true, formatter: new DateTimeFormatter() });
  price = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  triggerPrice = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
  currentPrice = new NumberCell({ withHoverStatus: true, formatter: this._priceFormatter });
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

  get complexInstrumentId(): string {
    return complexInstrumentId(this.order?.instrument?.id, this.order.accountId);
  }

  constructor(public order?: IOrder) {
    super();
    if (order)
      this.update(order);

    this.setInstrument();
  }

  setInstrument(instrument = this.order?.instrument) {
    if (!instrument)
      return;

    if (this.order)
      this.order.instrument = instrument;
    this._priceFormatter = InstrumentFormatter.forInstrument(instrument);

    this.price.formatter = this._priceFormatter;
    this.price.refresh();

    this.triggerPrice.formatter = this._priceFormatter;
    this.triggerPrice.refresh();

    this.currentPrice.formatter = this._priceFormatter;
    this.currentPrice.refresh();

    this.averageFillPrice.formatter = this._priceFormatter;
    this.averageFillPrice.refresh();

    this.description.updateValue(instrument.description);
  }

  update(order: IOrder) {
    this.order = { ...this.order, ...order };

    [
      OrderColumn.averageFillPrice,
      OrderColumn.price,
      OrderColumn.triggerPrice,
      OrderColumn.duration,
      OrderColumn.filledQuantity,
      OrderColumn.quantity,
      OrderColumn.timestamp,
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

  applySettings() {
    this.timestamp.updateValue(this.timestamp._value, true);
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
    if (this.highlightOnlyActive && !excludedStatuses.includes(this.order.status))
      cell.setStatusPrefix(inactivePrefixStatus);
    else
      cell.setStatusPrefix('');

    if (this.order.status === OrderStatus.Stopped)
      cell.setStatusPrefix(heldPrefixStatus);

    cell.changeStatus(this.side.value.toLowerCase());
  }

  private _updateSelectedStatus(): void {
    const selectedStatusName = this.getSelectedStatus();
    allColumns.forEach(field => (this[field] as Cell).setStatusPrefix(selectedStatusName));
  }

  private getSelectedStatus() {
    if (this.order?.status === OrderStatus.Stopped)
      return this.isSelected ? StopSelectedStatus : heldPrefixStatus;
    if (this.highlightOnlyActive && !this.isSelected && !excludedStatuses.includes(this.order.status)) {
      return inactivePrefixStatus;
    }
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
