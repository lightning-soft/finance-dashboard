import { Cell, DataCell, NumberCell } from 'data-grid';
import { IInstrument, IOrder, OrderStatus } from 'trading';
import { Id } from 'communication';
import { IMarketWatchItem, ItemType } from './interface-market-watch.item';
import { ActionsCell } from './actions.cell';
import { OrderColumnsArray } from 'base-order-form';

const prefix = 'order';

export class MarketWatchSubItem implements IMarketWatchItem {
  id: Id;
  order: IOrder;
  priceEnabledStatus = 'Price';
  priceDisabledStatus = 'PriceDisabled';

  actions: ActionsCell = new ActionsCell();
  accountId: Cell = new DataCell();
  identifier: Cell = new DataCell();
  side: Cell = new DataCell();
  quantity: NumberCell = new NumberCell();
  type: DataCell = new DataCell();
  price: NumberCell = new NumberCell({ hightlightOnChange: false });
  triggerPrice: NumberCell = new NumberCell({ hightlightOnChange: false });
  averageFillPrice: NumberCell = new NumberCell();
  duration: DataCell = new DataCell();
  description: DataCell = new DataCell();
  status: DataCell = new DataCell();
  emptyCell = new DataCell();

  instrument: IInstrument;
  itemType = ItemType.SubItem;

  symbol: Cell;
  pos: Cell;
  last: Cell;
  netChange: Cell;
  percentChange: Cell;
  workingBuys: Cell;
  bidQuantity: Cell;
  bid: Cell;
  ask: Cell;
  askQuantity: Cell;
  workingSells: Cell;
  volume: Cell;
  settle: Cell;
  high: Cell;
  low: Cell;
  open: Cell;


  constructor(order?: IOrder) {
    OrderColumnsArray.forEach(item => {
      const cell = this[item];
      if (cell)
        cell.setStatusPrefix(this.getPrefix());
    });
    this.actions.setStatusPrefix(this.getPrefix());
    this.actions.setState({ play: false, close: true, stop: true });
    this.emptyCell.setStatusPrefix(this.getPrefix());

    if (order)
      this.updateOrder(order);
  }

  protected getPrefix() {
    return prefix;
  }

  checkAction(event: MouseEvent) {
    return this.actions.checkAction(event);
  }

  updateOrder(order: IOrder) {
    this.identifier.updateValue(order.id);
    this.identifier.changeStatus(order.side);

    this.actions.changeStatus(order.side);

    this.id = order.id;
    this.order = order;

    const isStopped = order.status === OrderStatus.Stopped;
    this.actions.setState({ play: isStopped, stop: !isStopped, close: true });

    this.side.updateValue(order.side.toUpperCase());
    this.side.changeStatus(order.side);

    this.accountId.updateValue(order.account.id.toUpperCase());
    this.accountId.changeStatus(order.side);

    this.quantity.updateValue(order.quantity);
    this.quantity.changeStatus(order.side);

    this.type.updateValue(order.type.toUpperCase());
    this.type.changeStatus(order.side);

    this.price.updateValue(order.price);
    this.price.changeStatus(this.priceEnabledStatus);

    this.triggerPrice.updateValue(order.triggerPrice);
    this.triggerPrice.changeStatus(this.priceEnabledStatus);

    this.averageFillPrice.updateValue(order.averageFillPrice);
    this.averageFillPrice.changeStatus(order.side);

    this.duration.updateValue(order.duration.toUpperCase());
    this.duration.changeStatus(order.side);

    this.description.updateValue(order.description);
    this.description.changeStatus(order.side);

    this.status.updateValue(order.status);
    this.status.changeStatus(order.side);

    this.emptyCell.changeStatus(order.side);
  }

  applySettings(settings) {
    for (const key in settings) {
      const cell = this[settings[key]];
      this[key] = cell ?? this.emptyCell;
    }
    this.symbol = this.actions;
  }

  clearRealtimeData() {
  }
}
