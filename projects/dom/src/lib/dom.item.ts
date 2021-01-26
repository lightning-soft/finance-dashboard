import { IBaseItem, Id } from 'communication';
import { AddClassStrategy, Cell, DataCell, IFormatter, NumberCell } from 'data-grid';
import { ITrade, L2, OrderSide } from 'trading';
import { DomSettings } from './dom-settings/settings';
import { HistogramCell } from './histogram';
import { PriceCell } from './price.cell';


class TotalCell extends HistogramCell {
  updateValue(value: number) {
    return super.updateValue((this._value ?? 0) + (value ?? 0));
  }
}

class TotalTimeCell extends HistogramCell {
  trackTime = 4000;
  updateValue(value: number) {
    if (this.time + this.trackTime < Date.now())
      return super.updateValue(this._value + value);
    else
      return super.updateValue(value);
  }
}

export class DomItem implements IBaseItem {
  id: Id;

  isCenter = false;

  _id: Cell = new NumberCell();
  price: PriceCell;
  lastPrice: number;
  orders: Cell = new DataCell();
  ltq: Cell;
  bid: HistogramCell;
  ask: HistogramCell;
  currentAsk: HistogramCell;
  currentBid: HistogramCell;
  totalAsk: HistogramCell;
  totalBid: HistogramCell;
  tradeColumn: Cell = new DataCell();
  volume: HistogramCell;
  askDelta: Cell;
  bidDelta: Cell;
  askDepth: Cell = new DataCell();
  bidDepth: Cell = new DataCell();

  private _bid: number;
  private _ask: number;

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter) {
    this.id = index;
    this.price = new PriceCell({ strategy: AddClassStrategy.NONE, formatter: _priceFormatter, settings: settings.price });
    this.bid = new TotalCell({ settings: settings.bid });
    this.ask = new TotalCell({ settings: settings.ask });
    this.currentAsk = new TotalTimeCell({ settings: settings.currentAsk });
    this.currentBid = new TotalTimeCell({ settings: settings.currentBid });
    this.totalAsk = new TotalCell({ settings: settings.totalAsk });
    this.totalBid = new TotalCell({ settings: settings.totalBid });
    this.volume = new TotalCell({ settings: settings.volume });
    this.askDelta = new NumberCell({ strategy: AddClassStrategy.NONE, settings: settings.askDelta });
    this.bidDelta = new NumberCell({ strategy: AddClassStrategy.NONE, settings: settings.bidDelta });
    this.ltq = new NumberCell({ strategy: AddClassStrategy.NONE, settings: settings.ltq });
    this._id.updateValue(index);
  }

  clearDelta() {
    this.askDelta.clear();
    this.bidDelta.clear();
    this._ask = null;
    this._bid = null;
  }

  clearLTQ() {
    this.ltq.clear();
  }

  setPrice(price) {
    this.price.updateValue(price);
  }

  handleTrade(data: ITrade) {
    this.setPrice(data.price);
    this.ltq.updateValue(data.volume);
    this.volume.updateValue(data.volume);
    this.currentAsk.updateValue(data.askInfo.volume);
    this.currentBid.updateValue(data.bidInfo.volume);
    this.totalAsk.updateValue(data.askInfo.volume);
    this.totalBid.updateValue(data.bidInfo.volume);

    return {
      volume: this.volume._value,
      totalAsk: this.totalAsk._value,
      totalBid: this.totalBid._value,
      currentAsk: this.currentAsk._value,
      currentBid: this.currentBid._value,
    }
  }

  handleL2(l2: L2) {
    if (l2.side == OrderSide.Buy) {
      this.ask.updateValue(l2.size);

      if (this._ask == null)
        this._ask = this.ask._value;

      this.askDelta.updateValue(this._ask - this.ask._value);
    } else if (l2.side == OrderSide.Sell) {
      this.bid.updateValue(l2.size);

      if (this._bid == null)
        this._bid = this.bid._value;

      this.bidDelta.updateValue(this._bid - this.bid._value);
    }

    return {
      ask: this.ask._value,
      bid: this.bid._value,
    }
  }
}
