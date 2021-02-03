import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, IFormatter, NumberCell } from 'data-grid';
import { IInfo, IOrder, L2, OrderSide, OrderStatus } from 'trading';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';
import { PriceCell } from './price.cell';

class OrderCell extends NumberCell {
  private _order: IOrder;
  private _text: string;

  orderStyle: 'ask' | 'bid';

  addOrder(order: IOrder) {
    this._order = order;
    this._changeText();
  }

  clearOrder() {
    this._order = null;
    this._text = '';
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
    const x = context.x;
    const y = context.y;
    const width = context.width;
    const height = context.height;

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    if (this.orderStyle == 'ask') {
      ctx.fillStyle = 'rgba(201, 59, 59, 0.5)';
      ctx.strokeStyle = '#C93B3B';
    } else {
      ctx.fillStyle = 'rgba(72, 149, 245, 0.5)';
      ctx.strokeStyle = '#4895F5';
    }
    ctx.fill();
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.textAlign = "end";
    ctx.fillStyle = 'white';

    ctx.fillText(this._text, x + width, (y + height / 2), width);
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

class LtqCell extends NumberCell {
  updateValue(value: number) {
    if ((this.settings as any).accumulateTrades != false)
      return super.updateValue(this._value + value);
    else
      return super.updateValue(value);
  }

  // clear(isTheSameItem?: boolean) {
  //   if ((this.settings as any).accumulateTrades != false && isTheSameItem)
  //     return;

  //   super.clear();
  // }
}

class TotalTimeCell extends HistogramCell {
  updateValue(value: number) {
    if (this.time + ((this.settings as any).clearInterval || 0) < Date.now())
      return super.updateValue(this._value + value);
    else
      return super.updateValue(value);
  }
}

export class DomItem implements IBaseItem {
  id: Id;

  isCenter = false;

  get lastPrice(): number {
    return this.price._value;
  }

  _id: Cell = new NumberCell();
  price: PriceCell;
  orders: OrderCell = new OrderCell();
  ltq: LtqCell;
  bid: HistogramCell;
  ask: HistogramCell;
  currentAsk: HistogramCell;
  currentBid: HistogramCell;
  totalAsk: HistogramCell;
  totalBid: HistogramCell;
  tradeColumn: Cell = new DataCell();
  volume: HistogramCell;
  askDelta: OrderCell;
  bidDelta: OrderCell;
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

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
    this.askDelta = new OrderCell({ strategy: AddClassStrategy.NONE, settings: settings.askDelta, ignoreZero: false });
    this.bidDelta = new OrderCell({ strategy: AddClassStrategy.NONE, settings: settings.bidDelta, ignoreZero: false });
    this.ltq = new LtqCell({ strategy: AddClassStrategy.NONE, settings: settings.ltq });
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

  handleAsk(data: IInfo) {
    if (data && data.timestamp >= (this.currentAsk.time || 0)) {
      this.currentAsk.updateValue(data.volume);
      this.totalAsk.updateValue(data.volume);
    }

    this.ltq.updateValue(data.volume);
    this.ltq.changeStatus('ask');
    this.volume.updateValue(this.totalBid._value || 0 + this.totalAsk._value || 0);
    this.price.isTraded = this.volume._value != null;
    this.setPrice(data.price);

    return {
      volume: this.volume._value,
      totalAsk: this.totalAsk._value,
      currentAsk: this.currentAsk._value,
      ltq: this.ltq._value,
      price: this.price._value,
    }
  }

  handleBid(data: IInfo) {
    if (data && data.timestamp >= (this.currentBid.time || 0)) {
      this.currentBid.updateValue(data.volume);
      this.totalBid.updateValue(data.volume);
    }

    this.ltq.updateValue(data.volume);
    this.ltq.changeStatus('bid');
    this.volume.updateValue(this.totalBid._value || 0 + this.totalAsk._value || 0);
    this.price.isTraded = this.volume._value != null;
    this.setPrice(data.price);

    return {
      volume: this.volume._value,
      totalBid: this.totalBid._value,
      currentBid: this.currentBid._value,
      ltq: this.ltq._value,
      price: this.price._value,
    }
  }

  handleL2(l2: L2) {
    if (l2.side == OrderSide.Buy) {
      this.ask.updateValue(l2.size);

      if (this._ask == null)
        this._ask = this.ask._value;

      this.askDelta.updateValue(this.ask._value - this._ask);
    } else if (l2.side == OrderSide.Sell) {
      this.bid.updateValue(l2.size);

      if (this._bid == null)
        this._bid = this.bid._value;

      this.bidDelta.updateValue(this.bid._value - this._bid);
    }

    return {
      ask: this.ask._value,
      bid: this.bid._value,
      askDelta: this.askDelta._value,
      bidDelta: this.bidDelta._value,
    }
  }

  handleOrder(order: IOrder) {
    // switch (order.status) {
    //   case OrderStatus.Filled:
    //   case OrderStatus.Canceled:
    //   case OrderStatus.Rejected:
    //     this.orders.clearOrder();
    //     this.askDelta.clearOrder();
    //     this.bidDelta.clearOrder();
    //     break;
    //   default:
    this.orders.addOrder(order);

    if (order.side == OrderSide.Sell) {
      this.askDelta.addOrder(order);
      this.askDelta.orderStyle = 'ask';
      this.orders.orderStyle = 'ask';
    } else {
      this.bidDelta.addOrder(order);
      this.bidDelta.orderStyle = 'bid';
      this.orders.orderStyle = 'bid';
    }
    //     break;
    // }
  }

  dehighlight(key: string) {
    if (key == 'all')
      return Object.keys(this).forEach(i => this.dehighlight(i));

    if (this[key] && this[key].dehightlight) {
      this[key].dehightlight();
    }
  }
}
