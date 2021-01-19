import { ITrade, L2, OrderSide } from "trading";



export interface IDomDataTimes extends IDomData {
  price: number;
}
export interface IDomData {
  readonly volume: number;
  readonly currentAsk: number;
  readonly currentBid: number;
  readonly ask: number;
  readonly bid: number;
  readonly totalAsk: number;
  readonly totalBid: number;

  time?: IDomDataTimes;
  updatedAt?: number;
}

class Total implements IDomData {
  volume = 0;
  currentAsk = 0;
  currentBid = 0;
  ask = 0;
  bid = 0;
  totalAsk = 0;
  totalBid = 0;

  handleTrade(trade: ITrade) {
    this.volume += trade.volume;
    this.currentAsk += trade.askInfo.volume;
    this.currentBid += trade.bidInfo.volume;
  }

  handleL2(trade: L2) {
    if (trade.side == OrderSide.Sell) {
      this.ask += trade.size;
    } else if (trade.side == OrderSide.Buy) {
      this.bid += trade.size;
    }
  }
}

class ColumnsAccumulator implements IDomData {
  volume = 0;
  currentAsk = 0;
  currentBid = 0;
  ask = 0;
  bid = 0;
  totalAsk = 0;
  totalBid = 0;

  handleChange(change: Partial<IDomData>) {
    if (!change)
      return;

    for (const key in change)
      this[key] += change[key];
  }
}

class DomItemData implements IDomData {
  volume: number = 0;
  currentAsk: number = 0;
  currentBid: number = 0;
  ask: number = 0;
  bid: number = 0;
  totalAsk: number = 0;
  totalBid: number = 0;

  time: IDomData & { price: number } = {
    volume: 0,
    currentAsk: 0,
    currentBid: 0,
    ask: 0,
    bid: 0,
    totalAsk: 0,
    totalBid: 0,
    price: 0,
  };

  updatedAt;

  handleTrade(trade: ITrade) {
    const change = {
      volume: trade.volume - this.volume,
      currentAsk: trade.askInfo.volume - this.currentAsk,
      currentBid: trade.bidInfo.volume - this.currentBid,
    }

    this.volume = trade.volume;
    this.currentAsk = trade.askInfo.volume;
    this.currentBid = trade.bidInfo.volume;
    this.time.price = this.updatedAt = Date.now();

    return this._handleTime(change);
  }

  handleL2(trade: L2): Partial<IDomData> {
    if (trade.side == OrderSide.Sell) {
      const ask = trade.size - this.ask;
      this.ask = trade.size;
      this.totalAsk = +trade.size;
      this.updatedAt = Date.now();

      return this._handleTime({ ask, totalAsk: trade.size });
    } else if (trade.side == OrderSide.Buy) {
      const bid = trade.size - this.bid;
      this.bid = trade.size;
      this.totalBid += trade.size;
      this.updatedAt = Date.now();

      return this._handleTime({ bid, totalBid: trade.size })
    }
  }

  _handleTime(changes) {
    if (changes) {
      for (const key in changes) {
        if (changes.hasOwnProperty(key) && changes[key] != 0)
          this.time[key] = Date.now();
      }
    }

    return changes
  }
}

export class DomHandler {
  private _acc = new Map<number, DomItemData>();
  private _total = new Total();
  private _columns = new ColumnsAccumulator();

  get total(): IDomData {
    return this._total;
  }

  get columns(): IDomData {
    return this._columns;
  }

  handleTrade(trade: ITrade) {
    this._total.handleTrade(trade);
    this._columns.handleChange(this._getAccamulateTrade(trade.price).handleTrade(trade));
  }

  handleL2(l2: L2) {
    if (!l2)
      return;

    this._columns.handleChange(this._getAccamulateTrade(l2.price).handleL2(l2));
  }

  getItemData(price: number): IDomData {
    return this._getAccamulateTrade(price);
  }

  private _getAccamulateTrade(price: number): DomItemData {
    if (!this._acc.has(price))
      this._acc.set(price, new DomItemData());

    return this._acc.get(price);
  }
}
