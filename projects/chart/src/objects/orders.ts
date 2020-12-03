import { StringHelper } from 'base-components';
import { IOrder, OrdersRepository, OrderStatus, OrderType } from 'trading';
import { ChartObjects } from './chart-objects';

declare const StockChartX: any;

const { uncapitalize } = StringHelper;

export class Orders extends ChartObjects<IOrder> {
  protected _repository = this._injector.get(OrdersRepository);

  init() {
    super.init();

    this._chart.on(StockChartX.OrderBarEvents.CANCEL_ORDER_CLICKED, ({ value }) => {
      this._repository.deleteItem(value.order).subscribe(
        () => value.remove(),
        err => console.error(err),
      );
    });
  }

  create(item: IOrder) {
    this._create(item, order => {
      const orderBar = new StockChartX.OrderBar({ order });

      orderBar.locked = true;

      return orderBar;
    });
  }

  update(item: IOrder) {
    this._update(item, order => ({ order }));
  }

  protected _isValid(item: IOrder) {
    return [OrderStatus.Canceled, OrderStatus.Rejected, OrderStatus.Filled].includes(item.status);
  }

  protected _map(item: IOrder) {
    const kindMap = {
      [OrderType.StopMarket]: 'stopLimit',
    };

    const statusMap = {
      [OrderStatus.Canceled]: 'pendingCancel',
      [OrderStatus.Rejected]: 'pendingCancel',
      [OrderStatus.Pending]: 'pendingReplace',
      [OrderStatus.New]: 'pendingSubmit',
      [OrderStatus.Filled]: 'submitted',
      [OrderStatus.PartialFilled]: 'accepted',
    };

    return {
      id: item.id,
      quantity: item.quantity,
      price: item.averageFillPrice,
      action: uncapitalize(item.side),
      kind: kindMap[item.type] || uncapitalize(item.type),
      state: statusMap[item.status],
      account: item.account,
    };
  }
}
