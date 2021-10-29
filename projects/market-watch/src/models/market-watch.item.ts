import { IBaseItem, Id } from 'communication';
import {
  AddClassStrategy,
  Cell,
  Column,
  getProfitStatus,
  HoverableItem,
  NumberCell,
  ProfitStatus,
  RoundFormatter
} from 'data-grid';
import {
  IInstrument,
  IOrder,
  IPosition,
  IQuote,
  isForbiddenOrder,
  OHLVData,
  OrderSide,
  QuoteSide,
  UpdateType,
  VolumeData
} from 'trading';
import { MarketWatchSubItem } from './market-watch.sub-item';
import { IMarketWatchItem, ItemType } from './interface-market-watch.item';
import { SymbolCell } from './symbol.cell';
import { MarketWatchCreateOrderItem } from './market-watch-create-order.item';
import { MarketWatchColumnsArray } from '../market-watch-columns.enum';
import { InstrumentFormatter } from '../../../data-grid/src/models/formatters/instrument.formatter';

export class MarketWatchItem extends HoverableItem implements IBaseItem, IMarketWatchItem {
  id: Id;
  instrument: IInstrument;
  buyOrders = new Map<Id, IOrder>();
  sellOrders = new Map<Id, IOrder>();

  private _ohlv: OHLVData;
  private _formatter = InstrumentFormatter.forInstrument();
  private _percentFormatter = new RoundFormatter(2);

  symbol: SymbolCell = new SymbolCell({ withHoverStatus: true });
  pos: Cell = new NumberCell({ strategy: AddClassStrategy.RELATIVE_ZERO, withHoverStatus: true });
  last: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });
  netChange: Cell = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    ignoreZero: false,
    formatter: this._percentFormatter, withHoverStatus: true
  });
  percentChange: Cell = new NumberCell({
    strategy: AddClassStrategy.RELATIVE_ZERO,
    ignoreZero: false,
    formatter: this._percentFormatter, withHoverStatus: true
  });
  workingBuys: Cell = new NumberCell({ strategy: AddClassStrategy.NONE, withHoverStatus: true });
  bidQuantity: Cell = new NumberCell({ strategy: AddClassStrategy.RELATIVE_PREV_VALUE, withHoverStatus: true });
  bid: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });
  ask: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });
  askQuantity: Cell = new NumberCell({ strategy: AddClassStrategy.RELATIVE_PREV_VALUE, withHoverStatus: true });
  workingSells: Cell = new NumberCell({ strategy: AddClassStrategy.NONE, withHoverStatus: true });
  volume: Cell = new NumberCell({ strategy: AddClassStrategy.NONE, withHoverStatus: true });
  settle: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });
  high: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });
  low: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });
  open: NumberCell = new NumberCell({
    strategy: AddClassStrategy.NONE,
    formatter: this._formatter,
    withHoverStatus: true
  });

  private _fieldsWithFormatter = [this.bid, this.ask, this.last, this.netChange, this.low, this.open, this.high, this.settle];

  shouldExpand = false;
  hasDrawings = false;

  private _hasCreatingOrder = false;
  itemType = ItemType.Item;
  subItems: IMarketWatchItem[] = [];

  constructor(config: Id | IInstrument) {
    super();
    if (typeof config === 'object') {
      this.setInstrument(config);
      this.id = config.id;
    } else {
      this.symbol.updateValue('Loading...');
      this.id = config;
    }
    this.symbol.editable = true;
    this.symbol.editType = 'loading';
    this.symbol.manualEdit = false;
  }

  protected _getPropertiesForHover(column: Column): string[] {
    return MarketWatchColumnsArray;
  }

  clearRealtimeData() {
    this.pos.clear();
    this.bid.clear();
    this.ask.clear();
    this.last.clear();
    this.netChange.clear();
    this.percentChange.clear();
    this.askQuantity.clear();
    this.bidQuantity.clear();
    this.volume.clear();
    this.settle.clear();
    this.high.clear();
    this.low.clear();
    this.open.clear();
  }

  toggleExpand(mouseEvent: MouseEvent) {
    return this.symbol.clickOnExpand(mouseEvent);
  }

  setShowDrawings(value: boolean) {
    this.symbol.setShowDrawings(value);
    this.hasDrawings = value;
  }

  setHasCreatingOrder(value: boolean) {
    this._hasCreatingOrder = value;
    this.updateExpanded();
  }

  applySettings(settings) {
    this.subItems.forEach(item => item.applySettings(settings));
  }

  setShouldExpand(value) {
    this.shouldExpand = value;
    this.updateExpanded();
  }

  processQuote(quote: IQuote) {
    if (quote.updateType === UpdateType.Undefined) {
      const quantity = quote.side === QuoteSide.Ask ? this.askQuantity : this.bidQuantity;
      const price = quote.side === QuoteSide.Ask ? this.ask : this.bid;

      price.updateValue(quote.price);
      quantity.updateValue(quote.volume);
    }
  }

  handleOrder(order) {
    const map = order.side === OrderSide.Buy ? this.buyOrders : this.sellOrders;
    const cell = order.side === OrderSide.Buy ? this.workingBuys : this.workingSells;
    if (isForbiddenOrder(order)) {
      this.deleteOrder(order, map);
      this.updateOrderCell(cell, map);
      this.updateExpanded();
      return;
    }

    if (!map.has(order.id)) {
      const item = new MarketWatchSubItem(order);
      item.instrument = this.instrument;
      this.subItems.push(item);
    } else {
      const orderSubItem = this.subItems.find(item => item.id === order.id) as MarketWatchSubItem;
      orderSubItem?.updateOrder(order);
    }

    map.set(order.id, order);
    this.updateExpanded();
    this.updateOrderCell(cell, map);
  }

  handleSettlePrice(price: number) {
    this.settle.updateValue(price);
    this._updateProfits();
  }

  private _updateProfits() {
    const settle = this.settle._value;
    if (!this._ohlv || settle == null)
      return;

    const income = this._ohlv.close - settle;
    this.netChange.updateValue(income);
    this.percentChange.updateValue(income / settle * 100);

    this.netChange.changeStatus(getProfitStatus(this.netChange, ProfitStatus.InProfit));
    this.percentChange.changeStatus(getProfitStatus(this.percentChange, ProfitStatus.InProfit));
  }

  updateExpanded() {
    const shouldShowDrawings = !!this.buyOrders.size || !!this.sellOrders.size || this._hasCreatingOrder;
    const showExpanded = this.shouldExpand && shouldShowDrawings;
    this.symbol.setExpanded(showExpanded);
    this.symbol.setShowDrawings(shouldShowDrawings && this.hasDrawings);
  }

  hasOrder(order: IOrder) {
    const map = order.side === OrderSide.Buy ? this.buyOrders : this.sellOrders;
    return map.has(order.id);
  }

  updateOrderCell(cell, map) {
    cell.updateValue(Array.from(map.values()).reduce((total: any, item: IOrder) => total + (item.quantity - item.filledQuantity), 0));
  }

  deleteOrder(order: IOrder, map: Map<Id, IOrder>) {
    this.subItems = this.subItems.filter(item => item.id !== order.id);
    map.delete(order.id);
  }

  deleteSubItem(subItem: MarketWatchSubItem | MarketWatchCreateOrderItem) {
    this.subItems = this.subItems.filter(item => item.id !== subItem.id);
  }

  getCreateItems() {
    return this.subItems.filter(item => item.itemType === ItemType.CreateItem);
  }

  handlePosition(position: IPosition) {
    this.pos.updateValue(position.buyVolume - position.sellVolume);
    this.pos.changeStatus(getProfitStatus(this.pos));
  }

  handleVolume(volumeData: VolumeData) {
    this.volume.updateValue(volumeData.volume);
  }

  setInstrument(instrument: IInstrument) {
    this.instrument = instrument;
    this._formatter = InstrumentFormatter.forInstrument(instrument);
    this._fieldsWithFormatter.forEach((item: NumberCell) => {
      item.formatter = this._formatter;
      if (item._value != null)
        item.refresh();
    });

    this.symbol.updateValue(instrument.symbol);
  }

  handleOHLV(ohlv: OHLVData) {
    this.open.updateValue(ohlv.open);
    this.high.updateValue(ohlv.high);
    this.low.updateValue(ohlv.low);
    this.volume.updateValue(ohlv.volume);
    this.last.updateValue(ohlv.close);
    this._ohlv = ohlv;
    this._updateProfits();
  }
}
