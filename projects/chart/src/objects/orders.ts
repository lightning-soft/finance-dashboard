import { StringHelper } from 'base-components';
import { IOrder, OrderDuration, OrdersFeed, OrdersRepository, OrderStatus, OrderType } from 'trading';
import { ChartObjects } from './chart-objects';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CreateOrderComponent } from '../modals/create-order/create-order.component';
// import { OrderBar } from '../models';

declare const StockChartX: any;

const { uncapitalize } = StringHelper;

export class Orders extends ChartObjects<IOrder> {
  protected _repository = this._injector.get(OrdersRepository);
  protected _modal: NzModalService;
  protected _dataFeed = this._injector.get(OrdersFeed);
  unsubscribeFn: () => void;

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
    this._chart.on(StockChartX.OrderBarEvents.ORDER_CREATED, this._createOrder);
    this._chart.on(StockChartX.OrderBarEvents.ORDER_PRICE_CHANGED, this._updateOrder);
    this._chart.on(StockChartX.OrderBarEvents.ORDER_UPDATED, this._updateOrder);
    this._chart.on(StockChartX.OrderBarEvents.CREATE_ORDER_SETTINGS_CLICKED, this._openDialog);
    this.unsubscribeFn = this._dataFeed.on((order) => {
      if (!this._barsMap[order.id]) {
        const orderBar = new StockChartX.OrderBar({
          order: this._map(order),
        });
        this._chart.mainPanel.addObjects(orderBar);
        this._barsMap[order.id] = orderBar;
      } else {
        const  orderBar = this._barsMap[order.id];
        orderBar.order = this._map(order);
        orderBar.update(false);
      }
      if (!this._isValid(order)) {
        this.delete(order.id);
      }
    });
  }

  _openDialog = (event) => {
    const price = event.value.order.price;
    this._modal.create({
      nzContent: CreateOrderComponent,
      nzFooter: null,
      nzWidth: 220,
      nzClassName: 'chart-create-order',
      nzComponentParams: {
        price
      }
    }).afterClose.subscribe((res) => {
      if (res)
        this._repository.createItem({ ...res, ...this.requestParams }).toPromise();
    });
  }
  _updateOrder = (event) => {
    const target = event.target;

    this._repository.updateItem(this.transformToIOrder(target.order, true))
      .pipe(
        untilDestroyed(this._instance)
      )
      .subscribe((item: any) => {
        /*  target.order = this._map(item.result, target.value.price);
          target.update();
          this._barsMap[event.target.order.id] = event.target;*/
        this._notifier.showSuccess('Order is updated');
      }, err => {
        this._notifier.showError('Fail to update order');
      });
  }

  _createOrder = (event) => {
    const order = event.target.order;
    const target = event.target;
    this._repository.createItem(this.transformToIOrder(order))
      .pipe(
        untilDestroyed(this._instance)
      )
      .subscribe((item: any) => {
        target.order = this._map(item.result, order.price);
        target.update();
        this._barsMap[target.order.id] = target;
        this._notifier.showSuccess('Order is created');
        // event.target.update();
        // this._chart.setNeedsUpdate();
      }, error => {
        target.remove();
        this._notifier.showError('Fail to create order');
      });
  }

  transformToIOrder(order, update = false) {
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
    const duration = durationMap[order.timeInForce];
    return {
      quantity: order.quantity,
      orderId: order.orderId,
      ...priceSpecs,
      duration,
      type,
      side: StringHelper.capitalize(order.action),
      ...this.requestParams
    };
  }

  _cancelOrder = ({ value }) => {
    const order = value.order;
    if (!order) {
      return;
    }

    if (!order.id) {
      value.remove();
    } else {
      this._repository.deleteItem(order)
        .pipe(untilDestroyed(this._instance))
        .subscribe(
          (item) => {
            /* this.delete(order.id);
             this._notifier.showSuccess('Order is cancelled');*/
          },
          err => {
            this._notifier.showError('Fail to create order');
          },
        );
    }

  }

  destroy() {
    super.destroy();
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_CREATED, this._createOrder);
    this._chart?.off(StockChartX.OrderBarEvents.CANCEL_ORDER_CLICKED, this._cancelOrder);
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_PRICE_CHANGED, this._updateOrder);
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_UPDATED, this._updateOrder);
    this._chart?.off(StockChartX.OrderBarEvents.CREATE_ORDER_SETTINGS_CLICKED, this._openDialog);
    if (this.unsubscribeFn)
      this.unsubscribeFn();

  }

  create(item: IOrder) {

    this._chart.setNeedsUpdate();
  }

  update(item: IOrder) {
    // this._update(item, order => ({ order }));
  }

  protected _isValid(item: IOrder) {
    return ![OrderStatus.Canceled, OrderStatus.Rejected, OrderStatus.Filled].includes(item.status);
  }

  protected _map(item: IOrder, _price?) {
    const kindMap = {
      [OrderType.StopMarket]: 'stop',
    };
    let price;
    if (item.type === OrderType.Limit)
      price = item.limitPrice;
    else if (item.type === OrderType.StopMarket)
      price = item.stopPrice;
    else if (item.type === OrderType.StopLimit) {
      price = item.limitPrice;
    } else {
      console.log(item);
      price = _price ? _price : item.averageFillPrice;
    }
    const timeInForce = Object.keys(durationMap)
      .find(key => durationMap[key] === item.duration);


    return {
      ...item,
      price,
      timeInForce,
      action: uncapitalize(item.side),
      kind: kindMap[item.type] || uncapitalize(item.type),
      state: statusMap[item.status],
    };
  }
}

const durationMap = {
  goodTillDate: OrderDuration.GTC,
  day: OrderDuration.DAY,
  goodTillCanceled: OrderDuration.GTC
};
const statusMap = {
  [OrderStatus.Canceled]: 'pendingCancel',
  [OrderStatus.Rejected]: 'pendingCancel',
  [OrderStatus.Pending]: 'pendingReplace',
  [OrderStatus.New]: 'pendingSubmit',
  [OrderStatus.Filled]: 'submitted',
  [OrderStatus.PartialFilled]: 'accepted',
};
