import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, CellStatus, DataCell, IFormatter, NumberCell, ProfitClass } from 'data-grid';
import { IOrder, IQuote, OrderSide, OrderStatus, QuoteSide, TradePrint, UpdateType } from 'trading';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';
import { PriceCell } from './price.cell';

const LevelsCount = 9;
export const LEVELS = new Array(LevelsCount).fill(' ').map((_, i) => (`level${i + 1}`));
export const TailInside = 'tailInside';


class OrdersCell extends HistogramCell {
  orders: IOrder[] = [];
  ocoOrder: IOrder;
  private _order: IOrder;
  private _text: string;

  orderStyle: 'ask' | 'bid' | 'oco';
  side: QuoteSide;
  pl: any;

  get canCancelOrder() {
    if (!this._order)
      return false;

    return this._isOrderColumn || (this.settings as any).overlayOrders == false;
  }

  private _isOrderColumn = false;

  constructor(config) {
    super(config);
    this._isOrderColumn = config.isOrderColumn === true;
    this.strategy = config.strategy ?? AddClassStrategy.NONE;
    this.side = config.side;
    this.orderStyle = config.side.toLowerCase();
  }

  addOcoOrder(ocoOrder) {
    this.ocoOrder = ocoOrder;
    this._order = ocoOrder;
    this.orderStyle = 'oco';
    this._changeText();
    this.drawed = false;
  }

  clearOcoOrder() {
    if (this.ocoOrder)
      this.clearOrder();
    this.ocoOrder = null;
  }

  addOrder(order: IOrder) {
    if (!order
      || this.side === QuoteSide.Ask && order.side !== OrderSide.Sell
      || this.side === QuoteSide.Bid && order.side !== OrderSide.Buy)
      return;

    const index = this.orders.findIndex(i => i.id === order.id);

    if (index !== -1)
      Object.assign(this.orders[index], order);
    else
      this.orders.push(order);

    this._order = order;
    this._changeText();
    this.drawed = false;
  }

  clearOrder() {
    this._order = null;
    this._text = '';
    this.drawed = false;
  }

  // changeStatus(status?: string) {
  //   if (this.orderStyle == 'ask') {
  //     super.changeStatus('sellOrder')
  //   } else if (this.orderStyle == 'bid') {
  //     super.changeStatus('buyOrder')
  //   } else {
  //     super.changeStatus(status);
  //   }
  // }

  removeOrder(order) {
    if (this.orders.map(item => item.id).includes(order.id)) {
      this.clearOrder();
      this.orders = this.orders.filter(item => item.id !== order.id);
    }
  }

  _changeText() {
    if (!this._order)
      return;

    const type = this._order.type.replace(/[^A-Z]/g, "");
    this._text = `${this._order.quantity}${type}`;
  }

  setPL(pl: number) {
    this.updateValue(pl);
    this.changeStatus(this.class === ProfitClass.DOWN ? 'loss' : 'inProfit');
  }

  clearPL() {
    this.updateValue(null);
  }

  draw(context) {
    if (!this._order || (this.settings as any).overlayOrders == false)
      return;

    const ctx = context?.ctx;
    if (!ctx)
      return;

    ctx.save();
    const padding = 3;
    const x = context.x + 1;
    const y = context.y + 1;
    const px = context.x + padding;
    const py = context.y + padding;
    const width = context.width - 2;
    const height = context.height - 2;
    const pwidth = context.width - padding * 2;
    const pheight = context.height - padding * 2;
    const sequenceNumber = this._order.currentSequenceNumber;
    const isAsk = this.orderStyle === 'ask';
    const isOrderColumn = this._isOrderColumn;
    const settings: any = this.settings || {};

    ctx.beginPath();
    ctx.rect(x, y, width, height);

    switch (this.orderStyle) {
      case 'ask':
        ctx.fillStyle = settings.sellOrderBackgroundColor ?? 'rgba(201, 59, 59, 0.5)';
        ctx.strokeStyle = settings.sellOrderColor ?? '#C93B3B';
        break;
      case 'bid':
        ctx.fillStyle = settings.buyOrderBackgroundColor ?? 'rgba(72,149,245,0.5)';
        ctx.strokeStyle = settings.buyOrderColor ?? '#4895f5';
        break;
      case 'oco':
        ctx.fillStyle = 'rgba(190,60,177, 0.5)';
        ctx.strokeStyle = '#be3cb1';
        break;
    }
    ctx.fill();
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.textAlign = isOrderColumn ? "end" : isAsk ? "start" : "end";
    ctx.fillStyle = ctx.strokeStyle ?? 'white';

    ctx.fillText(this._text, px + (isOrderColumn ? pwidth : isAsk ? 0 : pwidth), (py + pheight / 2), pwidth);

    if (sequenceNumber) {
      ctx.textAlign = isOrderColumn ? "start" : isAsk ? "end" : "start";
      const size = ctx.font.match(/\d*/)[0];
      const font = ctx.font.replace(/\d*/, size * 0.6);
      ctx.font = font;

      ctx.fillText(sequenceNumber, px + (isOrderColumn ? 0 : isAsk ? pwidth : 0), (py + pheight / 3), pwidth);
    }

    ctx.restore();

    return true;
  }
}

class TotalCell extends HistogramCell {
  updateValue(value: number) {
    return super.updateValue((this._value ?? 0) + (value ?? 0));
  }

  hightlight() {
    if (this.settings.highlightLarge && this._value < (this.settings.largeSize || 0)) {
      return;
    }

    super.hightlight();
  }
}

class LtqCell extends HistogramCell {
  updateValue(value: number) {
    if ((this.settings as any).accumulateTrades != false)
      return super.updateValue((this._value || 0) + value);
    else
      return super.updateValue(value);
  }
}

abstract class CompositeCell<T extends Cell> extends Cell {
  name: string;
  value: string;

  get drawed(): boolean {
    return this._getCell().drawed;
  }

  set drawed(value: boolean) {
    // this._drawed = value;
  }

  get status(): string {
    const prefix = this._item.side === QuoteSide.Ask ? 'askDelta' : 'bidDelta';
    return Cell.mergeStatuses(prefix, this._getCell().status);
  }

  set status(value: string) {

  }

  get visible(): boolean {
    return this._getCell().visible;
  }

  constructor(protected _item: DomItem) {
    super();
  }

  updateValue(...args: any[]) {
    throw new Error('Method not implemented.');
  }

  toString(): string {
    return this._getCell().toString();
  }

  protected abstract _getCell(): T;
}
class DeltaCell extends CompositeCell<OrdersCell> {
  protected _getCell(): OrdersCell {
    const item = this._item;
    return item.side === QuoteSide.Ask ? item.askDelta : item.bidDelta;
  }

  draw(context) {
    return this._getCell().draw(context);
  }
}

class AllOrdersCell extends CompositeCell<OrdersCell> {
  get orders() {
    return [
      ...(this._item.sellOrders.orders ?? []),
      ...(this._item.buyOrders.orders ?? []),
    ];
  }

  get canCancelOrder() {
    return this._item.sellOrders.canCancelOrder || this._item.buyOrders.canCancelOrder;
  }

  addOcoOrder(ocoOrder) {
    this._item.sellOrders.addOrder(ocoOrder);
    this._item.buyOrders.addOrder(ocoOrder);
  }

  clearOcoOrder() {
    this._item.sellOrders.clearOcoOrder();
    this._item.buyOrders.clearOcoOrder();
  }

  addOrder(order: IOrder) {
    this._item.sellOrders.addOrder(order);
    this._item.buyOrders.addOrder(order);
  }

  clearOrder() {
    this._item.sellOrders.clearOrder();
    this._item.buyOrders.clearOrder();
  }

  removeOrder(order) {
    this._item.sellOrders.removeOrder(order);
    this._item.buyOrders.removeOrder(order);
  }

  setPL(pl: number) {
    this._item.sellOrders.setPL(pl);
    this._item.buyOrders.setPL(pl);
  }

  clearPL() {
    this._item.sellOrders.clearPL();
    this._item.buyOrders.clearPL();
  }

  draw(context) {
    return this._item.sellOrders.draw(context) || this._item.buyOrders.draw(context);
  }

  protected _getCell(): OrdersCell {
    const item = this._item;
    return item.sellOrders.orders.length ? item.sellOrders : item.buyOrders;
  }
}

class LevelCell extends HistogramCell {

  private _levelTime: number;
  best: QuoteSide = null;

  update(value: number, timestamp: number, forceAdd: boolean) {
    // const result = this.updateValue(forceAdd || Date.now() <= (this.time + ((this.settings as any).clearTradersTimer || 0))
    const result = this.updateValue(forceAdd || (timestamp || Date.now()) <= (this.time + ((this.settings as any).clearTradersTimer || 0))
      ? (this._value || 0) + value : value, timestamp);

    if (result && (this.settings as any).momentumTails)
      this._levelTime = Date.now();

    this.setStatusPrefix(this.best != null ? TailInside : '');

    return result;
  }

  // return if no levels more, performance improvments
  calculateLevel(): boolean {
    if (!this._levelTime)
      return;

    const settings: any = this.settings;

    const level = Math.round((Date.now() - this._levelTime) / settings.levelInterval) + 1;
    if (!isNaN(level)) {
      if (level <= LevelsCount) {
        this.changeStatus(`level${level}`);
      } else if (level >= LevelsCount + 1) {
        this.changeStatus('');
        this._levelTime = null;
      }
      return true;
    }

    return false;
  }

  changeBest(best?: QuoteSide) {
    if (best == this.best)
      return;

    this.best = best;

    if (best != null) {
      this.changeStatus(`inside`);

      if (Date.now() >= (this.time + ((this.settings as any).clearTradersTimer || 0)))
        this.clear();
    } else if (this.status.includes(`inside`) || this.status.includes(TailInside)) {
      this.changeStatus('');
      this.setStatusPrefix('');
    }
  }
}

export const SumStatus = 'sum';

class SumHistogramCell extends HistogramCell {
  changeStatus(status: string) {
    super.changeStatus(status);
    if (status == SumStatus) {
      this.visible = true;
      this.hist = null;
    }
  }

  calcHist(value: number) {
    if (status == SumStatus) {
      this.hist = 0;
    } else {
      super.calcHist(value);
    }
  }
}

export class DomItem implements IBaseItem {
  id: Id;
  index: number;

  isCenter = false;

  side: QuoteSide;

  get lastPrice(): number {
    return this.price._value;
  }

  _id: Cell = new NumberCell();
  price: PriceCell;
  sellOrders: OrdersCell;
  buyOrders: OrdersCell;
  ltq: LtqCell;
  bid: HistogramCell;
  ask: HistogramCell;
  currentAsk: LevelCell;
  currentBid: LevelCell;
  totalAsk: HistogramCell;
  totalBid: HistogramCell;
  volume: HistogramCell;
  askDelta: OrdersCell;
  bidDelta: OrdersCell;
  notes: Cell = new DataCell();
  delta: DeltaCell;
  orders: AllOrdersCell;

  private _bid = 0;
  private _ask = 0;

  get isBidSideVisible() {
    return (this.bid.visible || this.bidDelta.visible);
  }

  get isAskSideVisible() {
    return (this.ask.visible || this.askDelta.visible);
  }

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter, state?: any) {
    this.index = index;
    this.price = new PriceCell({
      strategy: AddClassStrategy.NONE,
      formatter: _priceFormatter,
      settings: settings.price
    });
    this.bid = new SumHistogramCell({ settings: settings.bid, ignoreZero: false, hightlightOnChange: false });
    this.ask = new SumHistogramCell({ settings: settings.ask, ignoreZero: false, hightlightOnChange: false });
    this.currentAsk = new LevelCell({ settings: settings.currentAsk, hightlightOnChange: false });
    this.currentBid = new LevelCell({ settings: settings.currentBid, hightlightOnChange: false });
    this.totalAsk = new TotalCell({ settings: settings.totalAsk });
    this.totalBid = new TotalCell({ settings: settings.totalBid });
    this.volume = new TotalCell({ settings: settings.volume });
    this.askDelta = new OrdersCell({
      strategy: AddClassStrategy.NONE,
      ignoreZero: false,
      settings: settings.askDelta,
      hightlightOnChange: false,
      side: QuoteSide.Ask,
    });
    this.bidDelta = new OrdersCell({
      strategy: AddClassStrategy.NONE,
      ignoreZero: false,
      settings: settings.bidDelta,
      hightlightOnChange: false,
      side: QuoteSide.Bid,
    });
    this.ltq = new LtqCell({ strategy: AddClassStrategy.NONE, settings: settings.ltq });
    this.delta = new DeltaCell(this);
    this.orders = new AllOrdersCell(this);
    this.buyOrders = new OrdersCell({
      isOrderColumn: true,
      settings: settings.orders,
      strategy: AddClassStrategy.RELATIVE_ZERO,
      ignoreZero: false,
      formatter: _priceFormatter,
      side: QuoteSide.Bid,
    });
    this.sellOrders = new OrdersCell({
      isOrderColumn: true,
      settings: settings.orders,
      strategy: AddClassStrategy.RELATIVE_ZERO,
      ignoreZero: false,
      formatter: _priceFormatter,
      side: QuoteSide.Ask,
    });
    this._id.updateValue(index);
    this.setAskVisibility(true, true);
    this.setBidVisibility(true, true);

    if (state) {
      for (const key in state) {
        if (!this[key] || !this[key].updateValue)
          continue;

        this[key].updateValue(state[key]);
      }
    }
    this.dehighlight('all');
  }

  clearAskDelta() {
    this.askDelta.clear();
    this._ask = this.ask._value;
  }

  clearBidDelta() {
    this.bidDelta.clear();
    this._bid = this.bid._value;
  }

  clearLTQ() {
    this.ltq.changeStatus('');
    this.ltq.clear();
    this._updatePriceStatus();
  }

  setPrice(price) {
    this.price.updateValue(price);
    this.price.dehightlight();
  }

  handleTrade(trade: TradePrint) {
    if (this.ltq.time === trade.timestamp)
      return;

    const res: any = {};

    const forceAdd = this.ltq._value > 0;

    if (trade.side == OrderSide.Sell) {
      if (this.currentBid.update(trade.volume, trade.timestamp, forceAdd))
        res.currentBid = this.currentBid._value;

      if (this.totalBid.updateValue(trade.volume))
        res.totalBid = this.totalBid._value;

      if (this._changeLtq(trade.volume, 'buy')) {
        res.ltq = this.ltq._value;
        res.volume = this.volume._value;
      }
    } else {
      if (this.currentAsk.update(trade.volume, trade.timestamp, forceAdd))
        res.currentAsk = this.currentAsk._value;

      if (this.totalAsk.updateValue(trade.volume))
        res.totalAsk = this.totalAsk._value;

      if (this._changeLtq(trade.volume, 'sell')) {
        res.ltq = this.ltq._value;
        res.volume = this.volume._value;
      }
    }

    this.calculateLevel();
    return res;
  }

  handleQuote(data: IQuote) {
    if (data.side === QuoteSide.Ask)
      return this._handleAsk(data);
    else
      return this._handleBid(data);
  }

  private _handleAsk(data: IQuote) {
    const res: any = {};

    if (data.updateType == UpdateType.Undefined) {
      this.currentAsk.changeBest(QuoteSide.Ask);
      this.askDelta.changeStatus(CellStatus.Highlight);
    }

    if (this.ask.updateValue(data.volume)) {
      res.ask = this.ask._value;

      if (this._ask == null)
        this._ask = this.ask._value;
      else
        this.askDelta.updateValue(this.ask._value - this._ask);

      res.askDelta = this.askDelta.value;
    }

    this.clearBid();
    return this._getAskValues();
  }

  private _handleBid(data: IQuote) {
    const res: any = {};

    if (data.updateType == UpdateType.Undefined) {
      this.currentBid.changeBest(QuoteSide.Bid);
      this.bidDelta.changeStatus(CellStatus.Highlight);
    }

    if (this.bid.updateValue(data.volume)) {
      res.bid = this.bid._value;

      if (this._bid == null)
        this._bid = this.bid._value;
      else
        this.bidDelta.updateValue(this.bid._value - this._bid);

      res.bidDelta = this.bidDelta._value;
    }

    this.clearAsk();
    return this._getBidValues();
  }

  changePriceStatus(status: string) {
    if (this.price.status == CellStatus.Highlight)
      return;

    this.price.changeStatus(status);
  }

  private _updatePriceStatus() {
    if (this.ltq._value > 0) {
      this.price.hightlight();
      this.orders.hightlight();
    } else {
      this.price.dehightlight();
      this.orders.dehightlight();
    }
  }

  private _changeLtq(volume: number, side: string) {
    if (this.ltq.updateValue(volume)) {
      this.ltq.changeStatus(side);

      this.volume.updateValue(volume);
      this._updatePriceStatus();

      return true;
    }

    return false;
  }

  getSnapshot() {
    return {
      [this.lastPrice]: {
        price: this.lastPrice,
        sellOrders: this.sellOrders._value,
        buyOrders: this.buyOrders._value,
        ltq: this.ltq._value,
        bid: this.bid._value,
        ask: this.ask._value,
        currentAsk: this.currentAsk._value,
        currentBid: this.currentBid._value,
        totalAsk: this.totalAsk._value,
        totalBid: this.totalBid._value,
        volume: this.volume._value,
        askDelta: this.askDelta._value,
        bidDelta: this.bidDelta._value,
      }
    };
  }

  removeOrder(order: IOrder) {
    this.orders.removeOrder(order);
    this.askDelta.removeOrder(order);
    this.bidDelta.removeOrder(order);
    this.notes.clear();
  }

  clearBid() {
    this.bid.clear();
    this.clearBidDelta();
  }

  clearAsk() {
    this.ask.clear();
    this.clearAskDelta();
  }

  clearDelta() {
    this.clearAskDelta();
    this.clearBidDelta();
  }

  clearCurrentBidBest() {
    // if (this.ltq._value)
    //   return;

    this.currentBid.changeBest();
    // this.bidDelta.changeStatus('');
  }

  clearСurrentAskBest() {
    // if (this.ltq._value)
    //   return;

    this.currentAsk.changeBest();
    // this.askDelta.changeStatus('');
  }

  refresh() {
    return Object.keys(this).forEach(key => this[key]?.refresh && this[key].refresh());
  }

  setBidVisibility(isBidOut: boolean, isBidDeltaOut: boolean) {
    this.bidDelta.visible = isBidDeltaOut !== true;
    this.bid.visible = isBidOut !== true;

    return this._getBidValues();
  }

  changeBestStatus() {
    this.askDelta.changeStatus(this.currentAsk.best == QuoteSide.Ask ? CellStatus.Highlight : '');
    this.bidDelta.changeStatus(this.currentBid.best == QuoteSide.Bid ? CellStatus.Highlight : '');
  }

  private _getBidValues() {
    const res: any = {};

    if (this.bid.visible) {
      res.bid = this.bid._value;
    }
    if (this.bidDelta.visible) {
      res.bidDelta = this.bidDelta._value;
    }

    return this.isBidSideVisible ? res : true;
  }

  setAskVisibility(isAskOut: boolean, isAskDeltaOut: boolean) {
    this.askDelta.visible = isAskDeltaOut !== true;
    this.ask.visible = isAskOut !== true;

    return this._getAskValues();
  }

  private _getAskValues() {
    const res: any = {};

    if (this.ask.visible) {
      res.ask = this.ask._value;
    }
    if (this.askDelta.visible) {
      res.askDelta = this.askDelta._value;
    }

    return this.isAskSideVisible ? res : true;
  }

  handleOrder(order: IOrder) {
    switch (order.status) {
      case OrderStatus.Filled:
      case OrderStatus.Canceled:
      case OrderStatus.Rejected:
        this.notes.updateValue('');
        this.orders.clearOrder();
        this.askDelta.clearOrder();
        this.bidDelta.clearOrder();
        break;
      default:
        this.orders.addOrder(order);
        this.notes.updateValue(order.description);

        // if (order.side === OrderSide.Sell) {
        // this.askDelta.orderStyle = 'ask';
        // this.orders.orderStyle = 'ask';
        this.askDelta.addOrder(order);
        // } else {
        // this.bidDelta.orderStyle = 'bid';
        // this.orders.orderStyle = 'bid';
        this.bidDelta.addOrder(order);
        // }
        break;
    }
  }

  createOcoOrder(side: OrderSide, _order: IOrder) {
    const order = { ..._order, side };
    this.orders.addOcoOrder(order);
    if (side === OrderSide.Buy) {
      this.bidDelta.addOcoOrder(order);
    } else
      this.askDelta.addOcoOrder(order);

  }

  clearOcoOrder() {
    this.orders.clearOcoOrder();
    this.bidDelta.clearOcoOrder();
    this.askDelta.clearOcoOrder();
  }

  dehighlight(key: string) {
    if (key === 'all')
      return Object.keys(this).forEach(i => this.dehighlight(i));

    if (key == 'ltq')
      this._updatePriceStatus();

    if (this[key] && this[key].dehightlight) {
      this[key].dehightlight();
    }
  }

  setVolume(volume: number) {
    this.volume.updateValue(volume);
    this.volume.dehightlight();
    return { volume: this.volume._value };
  }

  calculateLevel(): boolean {
    const ask = this.currentAsk.calculateLevel();
    const bid = this.currentBid.calculateLevel();

    return ask || bid;
  }

  clearPL() {
    this.orders.clearPL();
  }

  setPL(pl: number) {
    this.orders.setPL(pl);
  }
}

export class CustomDomItem extends DomItem {
  private _values = {};

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter, snapshot: any) {
    super(index, settings, _priceFormatter);
    this._values = {};

    for (const key in snapshot) {
      if (snapshot.hasOwnProperty(key))
        this._values[key] = new DomItem(index, settings, _priceFormatter, snapshot[key]);
    }

    for (const price in snapshot) {
      if (snapshot.hasOwnProperty(price)) {
        const data = snapshot[price];
        const ltq = this.ltq._value + data.ltq ?? 0;
        const bid = this.bid._value + data.bid ?? 0;
        const ask = this.ask._value + data.ask ?? 0;
        const currentAsk = this.currentAsk._value + data.currentAsk ?? 0;
        const currentBid = this.currentBid._value + data.currentBid ?? 0;
        const totalAsk = this.totalAsk._value + data.totalAsk ?? 0;
        const totalBid = this.totalBid._value + data.totalBid ?? 0;
        const volume = this.volume._value + data.volume ?? 0;

        this.ltq.updateValue(isNaN(ltq) ? 0 : ltq);
        this.bid.updateValue(isNaN(bid) ? 0 : bid);
        this.ask.updateValue(isNaN(ask) ? 0 : ask);
        this.currentAsk.updateValue(isNaN(currentAsk) ? 0 : currentAsk);
        this.currentBid.updateValue(isNaN(currentBid) ? 0 : currentBid);
        this.totalAsk.updateValue(isNaN(totalAsk) ? 0 : totalAsk);
        this.totalBid.updateValue(isNaN(totalBid) ? 0 : totalBid);
        this.volume.updateValue(isNaN(volume) ? 0 : volume);
      }
    }

    this.dehighlight('all');
  }

  handleTrade(trade: TradePrint) {
    const item: DomItem = this._values[trade.price];
    if (item)
      item.handleTrade(trade);

    super.handleTrade(trade);
  }

  handleQuote(data: IQuote) {

    const item: DomItem = this._values[data.price];
    let mergedData;

    if (!item)
      return;

    if (data.side === QuoteSide.Ask) {
      const ask = item?.ask?._value ?? 0;
      mergedData = {
        ...data,
        volume: data.volume - ask + this.ask._value ?? 0,
      };
    } else {
      const bid = item?.bid._value ?? 0;
      mergedData = {
        ...data,
        volume: data.volume - bid + this.bid._value ?? 0,
      };
    }

    item.handleQuote(data);

    super.handleQuote(mergedData);
  }

  getSnapshot() {
    let res = {};

    for (const key in this._values) {
      if (this._values.hasOwnProperty(key))
        res = { ...res, ...this._values[key].getSnapshot() };
    }

    return res;
  }
}
