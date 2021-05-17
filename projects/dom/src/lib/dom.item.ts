import { IBaseItem, Id } from 'communication';
import {
  AddClassStrategy,
  Cell,
  CellStatus,
  CellStatusGetter,
  DataCell,
  IFormatter,
  NumberCell,
  ProfitClass
} from 'data-grid';
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
  private _quantitySequence;
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
    this.orderStyle = 'oco';
    this.prepareOrder();
  }

  clearOcoOrder() {
    if (this.ocoOrder)
      this.ocoOrder = null;
    this.orderStyle = this.side === QuoteSide.Ask ? 'ask' : 'bid';
    this.prepareOrder();
  }

  addOrder(order: IOrder) {
    if (!order
      || this.side === QuoteSide.Ask && order.side !== OrderSide.Sell
      || this.side === QuoteSide.Bid && order.side !== OrderSide.Buy)
      return;
    if (!this.orders.length) {
      this._quantitySequence = null;
    }
    const index = this.orders.findIndex(i => i.id === order.id);

    if (index !== -1)
      Object.assign(this.orders[index], order);
    else
      this.orders.push(order);

    this.prepareOrder();
  }

  prepareOrder() {
    if (this.ocoOrder)
      this._order = this.ocoOrder;
    else {
      if (!this.orders.length) {
        this._order = null;
        this._changeText();
        this.drawed = false;
        return;
      }
      const lastOrder = this.orders[this.orders.length - 1];
      this._order = this.orders
        .filter(item => item.type === lastOrder.type)
        .reduce((res, item) => {
          if (!res) {
            res = {
              type: item.type,
              id: item.id,
              quantity: item.quantity,
            } as IOrder;
          } else {
            res.quantity += res.quantity;
          }
          return res;
        }, null);
    }
    this._changeText();
    this.drawed = false;
  }

  changeQuantity(value: number) {
    if (value == null) {
      return;
    }
    if (value < this._quantitySequence || this._quantitySequence == null) {
      this._quantitySequence = value;
      this.drawed = false;
    }
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
      this.orders = this.orders.filter(item => item.id !== order.id);
      this.prepareOrder();
      this._changeText();
      this.drawed = false;
    }
  }

  _changeText() {
    if (!this._order)
      return;

    const type = this._order.type.replace(/[^A-Z]/g, '');
    this._text = `${this._order.quantity}${type}`;
  }

  getPl(): number {
    return this._value;
  }

  setPL(pl: number) {
    if (pl == null)
      this.clear();
    else
      this.updateValue(pl);

    let status = '';

    if (this.class === ProfitClass.DOWN)
      status = 'loss';
    else if (this.class === ProfitClass.UP)
      status = 'inProfit';

    this.changeStatus(status);
  }

  clearPL() {
    this.clear();
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
        ctx.fillStyle = settings.sellOrderBackgroundColor ?? 'rgba(201, 59, 59, 0.7)';
        ctx.strokeStyle = settings.sellOrderBorderColor ?? '#C93B3B';
        break;
      case 'bid':
        ctx.fillStyle = settings.buyOrderBackgroundColor ?? 'rgba(72,149,245,0.7)';
        ctx.strokeStyle = settings.buyOrderBorderColor ?? '#4895f5';
        break;
      case 'oco':
        ctx.fillStyle = 'rgba(190,60,177, 0.5)';
        ctx.strokeStyle = '#be3cb1';
        break;
    }
    ctx.fill();
    ctx.stroke();

    ctx.textBaseline = 'middle';
    ctx.textAlign = isOrderColumn ? 'end' : isAsk ? 'start' : 'end';
    const textColor = this.side === QuoteSide.Ask ? settings.sellOrderColor :
      settings.buyOrderColor;
    ctx.fillStyle = textColor ?? '#fff';

    ctx.fillText(this._text, px + (isOrderColumn ? pwidth : isAsk ? 0 : pwidth), (py + pheight / 2), pwidth);

    if (this._quantitySequence != null) {
      ctx.textAlign = isOrderColumn ? 'start' : isAsk ? 'end' : 'start';
      const size = ctx.font.match(/\d*/)[0];
      const font = ctx.font.replace(/\d*/, size * 0.6);
      ctx.font = font;
      ctx.fillText(`Q${this._quantitySequence}`, px + (isOrderColumn ? 0 : isAsk ? pwidth : 0), (py + pheight / 3), pwidth);
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
    return this._getCell().status;
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

  get status(): string {
    const prefix = this._item.side === QuoteSide.Ask ? 'askDelta' : 'bidDelta';
    return Cell.mergeStatuses(prefix, this._getCell().status);
  }

  set status(value: string) {
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
    if (ocoOrder.side === OrderSide.Buy)
      this._item.buyOrders.addOcoOrder(ocoOrder);
    else
      this._item.sellOrders.addOcoOrder(ocoOrder);
  }

  changeBidQuantity(quantity) {
    this._item.buyOrders.changeQuantity(quantity);
    this._item.bidDelta.changeQuantity(quantity);
  }

  changeAskQuantity(quantity) {
    this._item.sellOrders.changeQuantity(quantity);
    this._item.askDelta.changeQuantity(quantity);
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

  getPl(): number {
    return this._item.sellOrders.getPl() || this._item.buyOrders.getPl();
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
  private _hiddenValue: number;

  get size() {
    return this.status === SumStatus ? this._hiddenValue : this._value;
  }

  changeStatus(status: string) {
    super.changeStatus(status);
    if (status === SumStatus) {
      this.visible = true;
      this.hist = null;
    } else {
      this.updateValue(this._hiddenValue);
    }
  }

  update(value: number, status?: string | false): boolean {
    if (this.status === SumStatus && ((status === false) || (status !== SumStatus && this.status === status))) {
      const isChanged = this._hiddenValue !== value;
      this._hiddenValue = value;
      return isChanged;
    }

    if (this.status !== status) {
      if (this.status === SumStatus) {
        this.updateValue(this._hiddenValue);
        this._hiddenValue = null;
      }

      if (status !== false)
        this.changeStatus(status);
    }

    return this.updateValue(value);
  }

  // updateValue(value: number, time?: number) {
  //   return super.updateValue(value, time);
  // }

  calcHist(value: number) {
    if (this.status === SumStatus) {
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
  clearCross = true;

  _id: Cell = new NumberCell();
  price: PriceCell;
  sellOrders: OrdersCell;
  buyOrders: OrdersCell;
  ltq: LtqCell;
  bid: SumHistogramCell;
  ask: SumHistogramCell;
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

  protected _bid = 0;
  protected _ask = 0;
  private _hovered = false;

  get isBidSideVisible() {
    return (this.bid.visible || this.bidDelta.visible);
  }

  get isAskSideVisible() {
    return (this.ask.visible || this.askDelta.visible);
  }

  get lastPrice(): number {
    return this.price._value;
  }

  set hovered(value: boolean) {
    this._hovered = value;

    if (value) {
      this.price.hovered = this.ask.hovered || this.bid.hovered || this.price.hovered;
    } else {
      this.price.hovered = false;
    }
  }

  get hovered() {
    return this._hovered;
  }

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter, state?: any) {
    this.index = index;
    this.price = new PriceCell({
      strategy: AddClassStrategy.NONE,
      formatter: _priceFormatter,
      settings: settings.price,
      withHoverStatus: true,
      getStatusByStyleProp
    });
    this.bid = new SumHistogramCell({
      settings: settings.bid,
      ignoreZero: false,
      hightlightOnChange: false,
      withHoverStatus: true,
      getStatusByStyleProp
    });
    this.ask = new SumHistogramCell({
      settings: settings.ask,
      ignoreZero: false,
      hightlightOnChange: false,
      withHoverStatus: true,
      getStatusByStyleProp
    });
    this.currentAsk = new LevelCell({ settings: settings.currentAsk, hightlightOnChange: false });
    this.currentBid = new LevelCell({ settings: settings.currentBid, hightlightOnChange: false });
    this.totalAsk = new TotalCell({ settings: settings.totalAsk });
    this.totalBid = new TotalCell({ settings: settings.totalBid });
    this.volume = new TotalCell({ settings: settings.volume });
    this.askDelta = new OrdersCell({
      strategy: AddClassStrategy.NONE,
      ignoreZero: true,
      settings: settings.askDelta,
      hightlightOnChange: false,
      side: QuoteSide.Ask,
    });
    this.bidDelta = new OrdersCell({
      strategy: AddClassStrategy.NONE,
      ignoreZero: true,
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
    this._ask = this.ask.size;
  }

  clearBidDelta() {
    this.bidDelta.clear();
    this._bid = this.bid.size;
  }

  clearLTQ() {
    this.ltq.changeStatus('');
    this.ltq.clear();
    this.currentAsk.changeStatus('');
    this.currentBid.changeStatus('');
    this._updatePriceStatus();
  }

  setPrice(price) {
    this.price.updateValue(price);
    this.price.dehightlight();
  }

  handleTrade(trade: TradePrint) {
    const forceAdd = this.ltq._value > 0;

    if (trade.side === OrderSide.Sell) {
      this.currentBid.update(trade.volume, trade.timestamp, forceAdd);
      this.totalBid.updateValue(trade.volume);

      this._changeLtq(trade.volume, 'buy');
    } else {
      this.currentAsk.update(trade.volume, trade.timestamp, forceAdd);
      this.totalAsk.updateValue(trade.volume);

      this._changeLtq(trade.volume, 'sell');
    }

    this.calculateLevel();
  }

  handleQuote(data: IQuote) {
    if (data.side === QuoteSide.Ask)
      return this._handleAsk(data);
    else
      return this._handleBid(data);
  }

  private _handleAsk(data: IQuote) {
    if (data.updateType === UpdateType.Undefined) {
      this.currentAsk.changeBest(QuoteSide.Ask);
    }

    if (this.ask.update(data.volume, false)) {
      if (this._ask == null)
        this._ask = data.volume;
      else
        this._calculateAskDelta();

      this.orders.changeAskQuantity(data.volume);
    }

    if (this.clearCross)
      this.clearBid();
  }

  private _handleBid(data: IQuote) {
    if (data.updateType === UpdateType.Undefined) {
      this.currentBid.changeBest(QuoteSide.Bid);
    }

    if (this.bid.update(data.volume, false)) {
      if (this._bid == null)
        this._bid = data.volume;
      else
        this._calculateBidDelta();

      this.orders.changeAskQuantity(data.volume);
    }

    if (this.clearCross)
      this.clearAsk();
  }

  protected _calculateAskDelta() {
    return this.askDelta.updateValue(this.ask._value - this._ask);
  }

  protected _calculateBidDelta() {
    return this.bidDelta.updateValue(this.bid._value - this._bid);
  }

  changePriceStatus(status: string) {
    if (this.price.status == CellStatus.Highlight || this.price.status == CellStatus.Hovered)
      return;

    this.price.changeStatus(status);
  }

  revertPriceStatus() {
    this.price.revertStatus();
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
    const prevValue = this.ltq.value;

    if (this.ltq.updateValue(volume)) {
      this.ltq.changeStatus(!prevValue ? side : '');

      this.volume.updateValue(volume);
      this._updatePriceStatus();

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

  clearCurrentBidBest() {
    this.currentBid.changeBest();
    this.bidDelta.changeStatus('');
  }

  clearCurrentAskBest() {
    this.currentAsk.changeBest();
    this.askDelta.changeStatus('');
  }

  setBidSum(value: number) {
    this.bid.update(value == null ? this._bid : value, value == null ? '' : SumStatus);
  }

  setAskSum(value: number) {
    this.ask.update(value == null ? this._ask : value, value == null ? '' : SumStatus);
  }

  refresh() {
    return Object.keys(this).forEach(key => this[key]?.refresh && this[key].refresh());
  }

  setBidVisibility(isBidOut: boolean, isBidDeltaOut: boolean) {
    this.bidDelta.visible = isBidDeltaOut !== true;
    this.bid.visible = isBidOut !== true;
  }

  setAskVisibility(isAskOut: boolean, isAskDeltaOut: boolean) {
    this.askDelta.visible = isAskDeltaOut !== true;
    this.ask.visible = isAskOut !== true;
  }

  handleOrder(order: IOrder) {
    switch (order.status) {
      case OrderStatus.Filled:
      case OrderStatus.Canceled:
      case OrderStatus.Rejected:
        this.notes.updateValue('');
        this.orders.removeOrder(order);
        this.askDelta.removeOrder(order);
        this.bidDelta.removeOrder(order);
        break;
      default:
        this.orders.addOrder(order);
        this.askDelta.addOrder(order);
        this.bidDelta.addOrder(order);
        this.orders.changeAskQuantity(this.ask._value);
        this.orders.changeBidQuantity(this.bid._value);
        this.notes.updateValue(order.description);

        // if (order.side === OrderSide.Sell) {
        // this.askDelta.orderStyle = 'ask';
        // this.orders.orderStyle = 'ask';
        // } else {
        // this.bidDelta.orderStyle = 'bid';
        // this.orders.orderStyle = 'bid';
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
  private _domItems = {};

  clearCross = false;

  constructor(index, settings: DomSettings, _priceFormatter: IFormatter, snapshot: { [key: number]: DomItem }) {
    super(index, settings, _priceFormatter);
    this._domItems = snapshot;
    this.calculateFromItems();
    this.dehighlight('all');
  }

  handleTrade(trade: TradePrint) {
    const item: DomItem = this._domItems[trade.price];
    if (item)
      item.handleTrade(trade);

    return super.handleTrade(trade);
  }

  handleQuote(data: IQuote) {
    const item: DomItem = this._domItems[data.price];
    let mergedData;

    if (!item)
      return;

    if (data.side === QuoteSide.Ask) {
      const ask = item.ask.status === SumStatus ? 0 : item?.ask?._value ?? 0;
      mergedData = {
        ...data,
        volume: data.volume - ask + (this.ask._value ?? 0),
      };
    } else {
      const bid = item.ask.status === SumStatus ? 0 : item?.bid._value ?? 0;
      mergedData = {
        ...data,
        volume: data.volume - bid + (this.bid._value ?? 0),
      };
    }

    item.handleQuote(data);

    return super.handleQuote(mergedData);
  }

  calculateFromItems() {
    const snapshot = this._domItems;
    this.bid.update(0);
    this.ask.update(0);
    this.totalAsk.updateValue(0);
    this.totalBid.updateValue(0);
    this.volume.updateValue(0);

    for (const price in snapshot) {
      if (snapshot.hasOwnProperty(price)) {
        const data = snapshot[price];

        this.bid.update((this.bid._value ?? 0) + (data.bid._value ?? 0));
        this.ask.update((this.ask._value ?? 0) + (data.ask._value ?? 0));
        this.totalAsk.updateValue(data.totalAsk._value);
        this.totalBid.updateValue(data.totalBid._value);
        this.volume.updateValue(data.volume._value);
      }
    }
  }

  setBidSum(value) {
    super.setBidSum(value);
    this._bid = 0;
    if (value == null)
      this.calculateFromItems();
  }

  setAskSum(value) {
    super.setAskSum(value);
    this._ask = 0;
    if (value == null)
      this.calculateFromItems();
  }

  getDomItems() {
    return this._domItems;
  }

  // protected _calculateAskDelta() {
  //   const snapshot = this._domItems;
  //   let sum = 0;

  //   for (const price in snapshot) {
  //     if (snapshot.hasOwnProperty(price)) {
  //       const data = snapshot[price];

  //       sum += data.askDelta._value ?? 0;
  //     }
  //   }

  //   return this.askDelta.updateValue(sum);
  // }

  // protected _calculateBidDelta() {
  //   const snapshot = this._domItems;
  //   let sum = 0;
  //   // console.log('data.bidDelta._value -----');

  //   for (const price in snapshot) {
  //     if (snapshot.hasOwnProperty(price)) {
  //       const data = snapshot[price];

  //       if (!data.bidDelta._value)
  //         continue;

  //       sum += data.bidDelta._value ?? 0;
  //       // console.log('data.bidDelta._value', price, data.bidDelta._value);
  //     }
  //   }

  //   return this.bidDelta.updateValue(sum);
  // }
}

const getStatusByStyleProp: CellStatusGetter = (cell, style) => {
  if (cell.hovered && cell.hoverStatusEnabled && style === 'BackgroundColor') {
    return CellStatus.Hovered;
  }

  return cell.status;
}
