import { StringHelper } from 'base-components';
import { IOrder, OrdersFeed, OrderSide, OrdersRepository, OrderStatus, OrderType } from 'trading';
import { ChartObjects } from './chart-objects';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NzModalService } from 'ng-zorro-antd/modal';
import { getPriceSpecs } from 'base-order-form';

declare const StockChartX: any;

const { uncapitalize } = StringHelper;

export class Orders extends ChartObjects<IOrder> {
  protected _repository = this._injector.get(OrdersRepository);
  protected _modal: NzModalService;
  protected _dataFeed = this._injector.get(OrdersFeed);

  get requestParams() {
    return {
      symbol: this._instance.instrument.symbol,
      exchange: this._instance.instrument.exchange,
      accountId: this._instance.accountId,
    };
  }

  init() {
    super.init();
    this._modal = this._injector.get(NzModalService);

    this._chart.on(StockChartX.OrderBarEvents.CANCEL_ORDER_CLICKED, this._cancelOrder);
    this._chart.on(StockChartX.OrderBarEvents.ORDER_PRICE_CHANGED, this._updatePrice);
    this._chart.on(StockChartX.OrderBarEvents.ORDER_SETTINGS_CLICKED, this._updateOrder);
    this._chart.on(StockChartX.OrderBarEvents.CREATE_ORDER_SETTINGS_CLICKED, this._openDialog);
    this._chart.on(StockChartX.TradingPanelEvents.BUY_AREA_CONTEXT_MENU_CLICKED, this._tradingBuyAreaClicked);
    this._chart.on(StockChartX.TradingPanelEvents.SELL_AREA_CONTEXT_MENU_CLICKED, this._tradingSellAreaClicked);
  }

  _tradingSellAreaClicked = (event) => {
    this._instance.createOrderWithConfirm({ side: OrderSide.Sell, price: event.value.price });
  }
  _tradingBuyAreaClicked = (event) => {
    this._instance.createOrderWithConfirm({ side: OrderSide.Buy, price: event.value.price });
  }

  createOcoOrder(config) {
    const bar = this.createBar(config);
    bar.locked = true;
    this._instance.chart.mainPanel.addObjects(bar);
    this._barsMap['oco' + config.side] = bar;
  }

  clearOcoOrders() {
    const sellBar = this._barsMap['oco' + OrderSide.Sell];
    if (sellBar) {
      sellBar.remove();
      delete this._barsMap['oco' + OrderSide.Sell];
    }
    const buyBar = this._barsMap['oco' + OrderSide.Buy];
    if (buyBar) {
      buyBar.remove();
      delete this._barsMap['oco' + OrderSide.Buy];
    }
  }

  createBar(model) {
    return new StockChartX.OrderBar({
      order: this._map(model),
    });
  }

  getOrders(side?: OrderSide) {
    return Object.values(this._barsMap)
      .filter((item: any) => {
        if (!side)
          return true;
        if (item.order.isOco)
          return false;
        return item.order.side === side;
      }).map((item: any) => item.order);

  }

  private _openDialog = (event) => {
    const price = event.value.order.price;
    this._instance.createOrder({ price, side: OrderSide.Buy });
  }

  private _updatePrice = ($event) => {
    const order = this._mapToIOrder($event.target.order, true);
    const priceSpecs = getPriceSpecs(order, order.price,
      this._instance.instrument.tickSize);
    this._repository.updateItem({
      ...order, instrument: this._instance.instrument, ...priceSpecs
    }).toPromise();
  }

  private _updateOrder = (event) => {
    // this._instance.openOrderPanel();
  }


  private _mapToIOrder(order, update = false) {
    const priceSpecs: any = {};
    const typeMap = {
      stop: OrderType.StopMarket,
    };
    const type = typeMap[order.kind] || StringHelper.capitalize(order.kind);
    if (update) {
      const orderId = order.id;
      order = { ...order, orderId };
    }

    if ([OrderType.Limit, OrderType.StopLimit].includes(type)) {
      priceSpecs.limitPrice = order.price;
    }
    if ([OrderType.StopMarket, OrderType.StopLimit].includes(type)) {
      priceSpecs.stopPrice = order.price;
    }
    if (type === OrderType.StopLimit) {
      priceSpecs.limitPrice = order.price;
      priceSpecs.stopPrice = order.stopPrice;
    }
    const duration = order.duration;
    return {
      instrument: order.instument,
      account: order.account,
      quantity: order.quantity,
      orderId: order.orderId,
      id: order.id,
      ...priceSpecs,
      duration,
      type,
      price: order.price,
      side: StringHelper.capitalize(order.action),
      ...this.requestParams
    };
  }

  private _cancelOrder = ({ value }) => {
    const order = value.order;
    if (!order) {
      return;
    }
    if (order.isOco) {
      this._instance.clearOcoOrders();
      return;
    }

    if (!order.id) {
      value.remove();
    } else {
      this._repository.deleteItem(order)
        .pipe(untilDestroyed(this._instance))
        .subscribe(
          (item) => {
          },
          err => {
            this._notifier.showError('Fail to create order');
          },
        );
    }

  }

  destroy() {
    super.destroy();
    this._chart?.off(StockChartX.OrderBarEvents.CANCEL_ORDER_CLICKED, this._cancelOrder);
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_PRICE_CHANGED, this._updatePrice);
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_UPDATED, this._updateOrder);
    this._chart?.off(StockChartX.OrderBarEvents.CREATE_ORDER_SETTINGS_CLICKED, this._openDialog);
    this._chart?.off(StockChartX.TradingPanelEvents.SELL_AREA_CONTEXT_MENU_CLICKED, this._tradingSellAreaClicked);
    this._chart?.off(StockChartX.TradingPanelEvents.BUY_AREA_CONTEXT_MENU_CLICKED, this._tradingBuyAreaClicked);
  }

  protected _isValid(item: IOrder) {
    return ![OrderStatus.Canceled, OrderStatus.Rejected, OrderStatus.Filled].includes(item.status);
  }

  protected _map(item: IOrder, _price?) {
    const kindMap = {
      [OrderType.StopMarket]: 'stop',
    };

    return {
      ...item,
      action: uncapitalize(item.side),
      kind: kindMap[item.type] || uncapitalize(item.type),
      state: statusMap[item.status],
    };
  }
}

const statusMap = {
  [OrderStatus.Canceled]: 'pendingCancel',
  [OrderStatus.Rejected]: 'pendingCancel',
  [OrderStatus.Pending]: 'pendingReplace',
  [OrderStatus.New]: 'pendingSubmit',
  [OrderStatus.Filled]: 'submitted',
  [OrderStatus.PartialFilled]: 'accepted',
};
