import { StringHelper } from 'base-components';
import { IOrder, OrderDuration, OrdersFeed, OrdersRepository, OrderStatus, OrderType } from 'trading';
import { ChartObjects } from './chart-objects';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalOrderComponent } from '../modals/modal-order/modal-order.component';

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
    this._chart.on(StockChartX.OrderBarEvents.ORDER_CREATED, this._createOrder);
    this._chart.on(StockChartX.OrderBarEvents.ORDER_PRICE_CHANGED, this._updatePrice);
    this._chart.on(StockChartX.OrderBarEvents.ORDER_SETTINGS_CLICKED, this._updateOrder);
    this._chart.on(StockChartX.OrderBarEvents.CREATE_ORDER_SETTINGS_CLICKED, this._openDialog);
    this.unsubscribeFn = this._dataFeed.on((order) => {
        this.handle(order);
      }
    );
  }

  createBar(model) {
    return new StockChartX.OrderBar({
      order: this._map(model),
    });
  }

  private _openDialog = (event) => {
    const price = event.value.order.price;
    this._modal.create({
      nzContent: ModalOrderComponent,
      nzFooter: null,
      nzWidth: 167,
      nzClassName: 'chart-modal-order',
      nzComponentParams: {
        stopPrice: price,
        limitPrice: price
      }
    }).afterClose.subscribe((res) => {
      if (res)
        this._repository.createItem({ ...res, ...this.requestParams }).toPromise();
    });
  }

  private _updatePrice = ($event) => {
    this._repository.updateItem(this._mapToIOrder($event.target.order, true)).toPromise();
  }

  private _updateOrder = (event) => {
    const target = event.target;
    const order = this._mapToIOrder(target.order, true);
    this._modal.create(
      {
        nzContent: ModalOrderComponent,
        nzFooter: null,
        nzWidth: 167,
        nzClassName: 'chart-modal-order',
        nzComponentParams: {
          isEdit: true,
          ...order
        }
      }
    ).afterClose.subscribe((res) => {
      if (res)
        this._repository.updateItem({
          ...order,
          ...res, ...this.requestParams
        }).toPromise();
    });
  }

  private _createOrder = (event) => {
    const order = event.target.order;
    const target = event.target;
    this._repository.createItem(this._mapToIOrder(order))
      .pipe(
        untilDestroyed(this._instance)
      )
      .subscribe((item: any) => {
        target.order = this._map(item.result, order.price);
        target.locked = true;
        target.update();
        this._barsMap[target.order.id] = target;
        this._notifier.showSuccess('Order is created');
      }, error => {
        target.remove();
        this._notifier.showError('Fail to create order');
      });
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
      quantity: order.quantity,
      orderId: order.orderId,
      ...priceSpecs,
      duration,
      type,
      side: StringHelper.capitalize(order.action),
      ...this.requestParams
    };
  }

  private _cancelOrder = ({ value }) => {
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
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_PRICE_CHANGED, this._updatePrice);
    this._chart?.off(StockChartX.OrderBarEvents.ORDER_UPDATED, this._updateOrder);
    this._chart?.off(StockChartX.OrderBarEvents.CREATE_ORDER_SETTINGS_CLICKED, this._openDialog);
  }

  protected _isValid(item: IOrder) {
    return ![OrderStatus.Canceled, OrderStatus.Rejected, OrderStatus.Filled].includes(item.status);
  }

  protected _map(item: IOrder, _price?) {
    const kindMap = {
      [OrderType.StopMarket]: 'stop',
    };
    let price;
    switch (item.type) {
      case OrderType.Limit:
        price = item.limitPrice;
        break;
      case OrderType.StopMarket:
        price = item.stopPrice;
        break;
      case OrderType.StopLimit:
        price = item.limitPrice;
        break;
      default:
        price = _price ? _price : item.averageFillPrice;

    }

    return {
      ...item,
      price,
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
