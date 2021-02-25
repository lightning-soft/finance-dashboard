import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, IFormatter, NumberCell } from 'data-grid';
import { IOrder, IQuote, OrderSide, OrderStatus, QuoteSide, TradePrint, UpdateType } from 'trading';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';
import { PriceCell } from './price.cell';

const Levels = 9;

class OrdersCell extends HistogramCell {
  orders: IOrder[] = [];
  ocoOrder: IOrder;
  private _order: IOrder;
  private _text: string;

  orderStyle: 'ask' | 'bid' | 'oco';

  get canCancelOrder() {
    return (!this._order || (this.settings as any).overlayOrders == false)
  }

  private _isOrderColumn = false;

  constructor(config) {
    super(config);
    this._isOrderColumn = config.isOrderColumn === true;
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

  draw(context) {
    if (!this._order || (this.settings as any).overlayOrders == false)
      return;

    const ctx = context?.ctx;
    if (!ctx)
      return;

    ctx.save();
    const padding = 2;
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

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    switch (this.orderStyle) {
      case 'ask':
        ctx.fillStyle = 'rgba(201, 59, 59, 0.5)';
        ctx.strokeStyle = '#C93B3B';
        break;
      case 'bid':
        ctx.fillStyle = 'rgba(72,149,245,0.5)';
        ctx.strokeStyle = '#4895f5';
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
    ctx.fillStyle = 'white';

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

class LevelCell extends HistogramCell {
  private _levelTime: number;
  best: QuoteSide = null;

  update(value: number, timestamp: number, forceAdd: boolean) {
    const result = this.updateValue(forceAdd || Date.now() <= (this.time + ((this.settings as any).clearTradersTimer || 0))
      ? (this._value || 0) + value : value, timestamp);

    if (result)
      this._levelTime = Date.now();

    if (this.best != null) {
      this.changeStatus('tailInside');
    }

    return result;
  }

  // return if no levels more, performance improvments
  calculateLevel(): boolean {
    const settings: any = this.settings;

    const level = Math.round((Date.now() - this._levelTime) / settings.levelInterval);
    if (!isNaN(level)) {
      if (level <= Levels) {
        this.changeStatus(`level${level}`);
      } else if (level == Levels + 1) {
        this.changeStatus('');
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
      if ((this.settings as any).clearOnBest)
        this.clear();
    } else if (this.status == `inside` || this.status == `tailInside`) {
      this.changeStatus('');
    }
  }
}

export class DomItem implements IBaseItem {
  id: Id;
  index: number;

  isCenter = false;

  isBelowCenter = false;
  isAboveCenter = false;

  get lastPrice(): number {
    return this.price._value;
  }

  _id: Cell = new NumberCell();
  price: PriceCell;
  orders: OrdersCell;
  ltq: LtqCell;
  bid: HistogramCell;
  ask: HistogramCell;
  currentAsk: LevelCell;
  currentBid: LevelCell;
  totalAsk: HistogramCell;
  totalBid: HistogramCell;
  tradeColumn: Cell = new DataCell();
  volume: HistogramCell;
  askDelta: OrdersCell;
  bidDelta: OrdersCell;
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();
  notes: Cell = new DataCell();

  private _bid = 0;
  private _ask = 0;

  get isBidSideVisible() {
    return (this.bid.visible || this.bidDelta.visible);
  }

  get isAskSideVisible() {
    return (this.ask.visible || this.askDelta.visible);
  }


  constructor(index, settings: DomSettings, _priceFormatter: IFormatter) {
    this.index = index;
    this.price = new PriceCell({
      strategy: AddClassStrategy.NONE,
      formatter: _priceFormatter,
      settings: settings.price
    });
    this.bid = new HistogramCell({ settings: settings.bid, ignoreZero: false, hightlightOnChange: false });
    this.ask = new HistogramCell({ settings: settings.ask, ignoreZero: false, hightlightOnChange: false });
    this.currentAsk = new LevelCell({ settings: settings.currentAsk, hightlightOnChange: false });
    this.currentBid = new LevelCell({ settings: settings.currentBid, hightlightOnChange: false });
    this.totalAsk = new TotalCell({ settings: settings.totalAsk });
    this.totalBid = new TotalCell({ settings: settings.totalBid });
    this.volume = new TotalCell({ settings: settings.volume });
    this.askDelta = new OrdersCell({ strategy: AddClassStrategy.NONE, ignoreZero: false, settings: settings.askDelta, hightlightOnChange: false });
    this.bidDelta = new OrdersCell({ strategy: AddClassStrategy.NONE, ignoreZero: false, settings: settings.bidDelta, hightlightOnChange: false });
    this.ltq = new LtqCell({ strategy: AddClassStrategy.NONE, settings: settings.ltq });
    this.orders = new OrdersCell({ isOrderColumn: true, settings: settings.order });
    this._id.updateValue(index);
    this.setAskVisibility(true, true);
    this.setBidVisibility(true, true);
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
  }

  setPrice(price) {
    this.price.updateValue(price);
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
      this.askDelta.hightlight();
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
      this.bidDelta.hightlight();
      // this.currentAsk.clear();
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

  private _updatePiceStatus() {
    if (this.ltq._value > 0)
      this.price.hightlight();
    else
      this.price.dehightlight();
  }

  private _changeLtq(volume: number, side: string) {
    if (this.ltq.updateValue(volume)) {
      this.ltq.changeStatus(side);

      this.volume.updateValue(volume);
      this._updatePiceStatus();

      this.setPrice(this.price._value);

      return true;
    }

    return false;
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

  setCurrentBidBest() {
    this.currentBid.changeBest();
    this.bidDelta.dehightlight();
  }

  setСurrentAskBest() {
    this.currentAsk.changeBest();
    this.askDelta.dehightlight();
  }

  refresh() {
    return Object.keys(this).forEach(key => this[key]?.refresh && this[key].refresh());
  }

  setBidVisibility(isBidOut: boolean, isBidDeltaOut: boolean) {
    this.bidDelta.visible = isBidDeltaOut !== true;
    this.bid.visible = isBidOut !== true;

    return this._getBidValues();
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

        if (order.side === OrderSide.Sell) {
          this.askDelta.orderStyle = 'ask';
          this.orders.orderStyle = 'ask';
          this.askDelta.addOrder(order);
        } else {
          this.bidDelta.orderStyle = 'bid';
          this.orders.orderStyle = 'bid';
          this.bidDelta.addOrder(order);
        }
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

    // console.log(key);
    if (key == 'ltq')
      this._updatePiceStatus();

    if (this[key] && this[key].dehightlight) {
      this[key].dehightlight();
    }
  }

  setVolume(volume: number) {
    this.volume.updateValue(volume);
    this.volume.dehightlight();
    this._updatePiceStatus();
    return { volume: this.volume._value };
  }

  calculateLevel(): boolean {
    const ask = this.currentAsk.calculateLevel();
    const bid = this.currentBid.calculateLevel();

    return ask || bid;
  }
}
