import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, IFormatter, NumberCell } from 'data-grid';
import { IInfo, IOrder, L2, OrderSide, OrderStatus, TradePrint } from 'trading';
import { IQuote, QuoteSide } from 'trading';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';
import { PriceCell } from './price.cell';

class OrdersCell extends HistogramCell {
  orders: IOrder[] = [];
  private _order: IOrder;
  private _text: string;

  orderStyle: 'ask' | 'bid';
  private _isOrderColumn = false;

  constructor(config) {
    super(config);
    this._isOrderColumn = config.isOrderColumn === true;
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

  _changeText() {
    if (!this._order)
      return;

    const type = this._order.type.replace(/[^A-Z]/g, "");
    this._text = `${this._order.quantity}${type}`;
  }

  draw(context) {
    if (!this._order)
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
    if (isAsk) {
      ctx.fillStyle = 'rgba(201, 59, 59, 0.5)';
      ctx.strokeStyle = '#C93B3B';
    } else {
      ctx.fillStyle = 'rgba(72, 149, 245, 0.5)';
      ctx.strokeStyle = '#4895F5';
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

class TotalTimeCell extends HistogramCell {
  updateValue(value: number) {
    if (Date.now() < (this.time + ((this.settings as any).updateInterval || 0)))
      return super.updateValue((this._value || 0) + value);
    else
      return super.updateValue(value);
  }
}

export class DomItem implements IBaseItem {
  id: Id;

  isCenter = false;
  private _isOut: boolean;
  private _level: number;

  get lastPrice(): number {
    return this.price._value;
  }

  _id: Cell = new NumberCell();
  price: PriceCell;
  orders: OrdersCell;
  ltq: LtqCell;
  bid: HistogramCell;
  ask: HistogramCell;
  currentAsk: HistogramCell;
  currentBid: HistogramCell;
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

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter) {
    this.id = index;
    this.price = new PriceCell({
      strategy: AddClassStrategy.NONE,
      formatter: _priceFormatter,
      settings: settings.price
    });
    this.bid = new HistogramCell({ settings: settings.bid });
    this.ask = new HistogramCell({ settings: settings.ask });
    this.currentAsk = new TotalTimeCell({ settings: settings.currentAsk });
    this.currentBid = new TotalTimeCell({ settings: settings.currentBid });
    this.totalAsk = new TotalCell({ settings: settings.totalAsk });
    this.totalBid = new TotalCell({ settings: settings.totalBid });
    this.volume = new HistogramCell({ settings: settings.volume });
    this.askDelta = new OrdersCell({ strategy: AddClassStrategy.NONE, settings: settings.askDelta, ignoreZero: false });
    this.bidDelta = new OrdersCell({ strategy: AddClassStrategy.NONE, settings: settings.bidDelta, ignoreZero: false });
    this.ltq = new LtqCell({ strategy: AddClassStrategy.NONE, settings: settings.ltq });
    this.orders = new OrdersCell({ isOrderColumn: true, settings: settings.order });
    this._id.updateValue(index);
  }

  clearDelta() {
    this.askDelta.clear();
    this.bidDelta.clear();
    this._ask = this.ask._value || 0;
    this._bid = this.bid._value || 0;
  }

  clearLTQ() {
    this.ltq.clear();
  }

  setPrice(price) {
    this.price.updateValue(price);
  }

  handleTrade(trade: TradePrint) {
    const res: any = {};

    if (trade.side == OrderSide.Sell) {
      if (this.currentBid.updateValue(trade.volume))
        res.currentBid = this.currentBid._value;

      if (this.totalBid.updateValue(trade.volume))
        res.totalBid = this.totalBid._value;

      if (this._changeLtq(trade.volume, 'bid')) {
        res.ltq = this.ltq._value;
        res.volume = this.volume._value;
      }
    } else {
      if (this.currentAsk.updateValue(trade.volume))
        res.currentAsk = this.currentAsk._value;

      if (this.totalAsk.updateValue(trade.volume))
        res.totalAsk = this.totalAsk._value;

      if (this._changeLtq(trade.volume, 'ask')) {
        res.ltq = this.ltq._value;
        res.volume = this.volume._value;
      }
    }

    // console.log(trade.price, trade.side, this.currentAsk._value, this.currentAsk.drawed, this.currentBid._value, this.currentBid.drawed);

    return this._isOut ? null : res;
  }

  handleQuote(data: IQuote) {
    // console.log(data.price, data.side, data.volume);

    if (data.side === QuoteSide.Ask)
      return this._handleAsk({ volume: data.volume } as any);
    else
      return this._handleBid({ volume: data.volume } as any);
  }

  private _handleAsk(data: IInfo) {
    const res: any = {};

    if (this.ask.updateValue(data.volume)) {
      res.ask = this.ask._value;

      if (this._ask == null)
        this._ask = this.ask._value;
      else if (this.askDelta.updateValue(this.ask._value - this._ask))
        res.askDelta = this.askDelta.value;
    }

    return this._isOut ? null : res;
  }

  private _handleBid(data: IInfo) {
    const res: any = {};

    if (this.bid.updateValue(data.volume)) {
      res.bid = this.bid._value;

      if (this._bid == null)
        this._bid = this.bid._value;
      else if (this.bidDelta.updateValue(this.bid._value - this._bid))
        res.bidDelta = this.bidDelta._value;
    }

    return this._isOut ? null : res;
  }

  private _changeLtq(volume: number, side: string) {
    if (this.ltq.updateValue(volume)) {
      this.ltq.changeStatus(side);
      this.volume.updateValue(this.totalBid._value || 0 + this.totalAsk._value || 0);
      this.price.isTraded = this.volume._value != null;
      this.setPrice(this.price._value);

      return true;
    }

    return false;
  }

  clearBid() {
    this.bid.clear();
    // this.bid.visible = false;
    this.bidDelta.clear();
    // this.bidDelta.visible = false;
  }

  clearAsk() {
    console.log(this.lastPrice);
    this.ask.clear();
    // this.ask.visible = false;
    this.askDelta.clear();
    // this.askDelta.visible = false;
  }

  refresh() {
    return Object.keys(this).forEach(key => this[key].refresh && this[key].refresh());
  }

  handleL2(l2: L2) {
    const res: any = {};
    // if (l2.side == OrderSide.Buy) {
    //   if (this.currentBid.updateValue(l2.size))
    //     res.currentBid = this.currentBid._value;

    //   if (this.totalBid.updateValue(l2.size))
    //     res.totalBid = this.totalBid._value;


    //   if (this._changeLtq(l2.size, 'bid')) {
    //     res.ltq = this.ltq._value;
    //     res.volume = this.volume._value;
    //   }
    // } else if (l2.side == OrderSide.Sell) {
    //   if (this.currentAsk.updateValue(l2.size))
    //     res.currentAsk = this.currentAsk._value;

    //   if (this.totalAsk.updateValue(l2.size))
    //     res.totalAsk = this.totalAsk._value;

    //   if (this._changeLtq(l2.size, 'ask')) {
    //     res.ltq = this.ltq._value;
    //     res.volume = this.volume._value;
    //   }
    // }

    return res;
  }

  setOffset(offset: number, isOut: boolean) {
    const wasOut = this._isOut === true;
    this._isOut = isOut === true;
    this._level = offset;

    const visible = !isOut;
    this.askDelta.visible = visible;
    this.bidDelta.visible = visible;
    this.ask.visible = visible;
    this.bid.visible = visible;

    return isOut && wasOut;
  }

  handleOrder(order: IOrder) {
    switch (order.status) {
      case OrderStatus.Filled:
      case OrderStatus.Canceled:
      case OrderStatus.Rejected:
        this.orders.clearOrder();
        this.askDelta.clearOrder();
        this.bidDelta.clearOrder();
        break;
      default:
        this.orders.addOrder(order);
        this.notes.updateValue(order.description);

        if (order.side === OrderSide.Sell) {
          this.askDelta.addOrder(order);
          this.askDelta.orderStyle = 'ask';
          this.orders.orderStyle = 'ask';
        } else {
          this.bidDelta.addOrder(order);
          this.bidDelta.orderStyle = 'bid';
          this.orders.orderStyle = 'bid';
        }
        break;
    }
  }

  dehighlight(key: string) {
    if (key === 'all')
      return Object.keys(this).forEach(i => this.dehighlight(i));

    if (this[key] && this[key].dehightlight) {
      this[key].dehightlight();
    }
  }
}
