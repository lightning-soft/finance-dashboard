import { Injectable, Injector } from '@angular/core';
import { NumberHelper } from 'base-components';
import { RealtimeAction } from 'communication';
import { IOrder, IPosition, OrderDuration, OrderSide, OrderStatus, OrderType, PositionsRepository, Side } from 'trading';
import { FakeTradingRepository } from './fake-trading.repository';

const { randomFixedNumber } = NumberHelper;

@Injectable()
export class FakeOrdersRepository extends FakeTradingRepository<IOrder> {
  protected _positionsRepository: PositionsRepository;

  constructor(protected _injector: Injector) {
    super();

    setTimeout(() => {
      this._positionsRepository = this._injector.get(PositionsRepository);

      this._emulateTrading();
    });
  }

  createItem(item: IOrder) {
    return super.createItem({
      ...this._getItemSample(),
      ...item,
    });
  }

  closeOrder(order: IOrder) {
    this.deleteItem(+order.id).subscribe();
    this.createItem({ ...order, status: OrderStatus.Canceled }).subscribe();
  }

  createOrderFromPosition(position: IPosition) {
    const order = {
      side: position.side === Side.Long ? OrderSide.Buy : OrderSide.Sell,
      quantity: position.size,
      symbol: position.account,
      duration: OrderDuration.GTD,
    } as IOrder;

    (order as any).closePosition = true;

    this.createItem(order).subscribe();
  }

  protected itemsFilter(order: IOrder) {
    const { status } = this._getItemsParams;

    if (!status) {
      return true;
    }

    return order.status === status;
  }

  protected async _getItems(): Promise<IOrder[]> {
    return [];

    // return Array.from({ length: 100 }, () => this._getItemSample());
  }

  protected _getItemSample(): IOrder {
    const id = this._id;

    return {
      id,
      accountId: null,
      symbol: 'BTCUSD',
      exchange: null,
      side: (id % 2 === 0) ? OrderSide.Buy : OrderSide.Sell,
      quantity: 0.1,
      limitPrice: randomFixedNumber(100),
      stopPrice: randomFixedNumber(100),
      duration: OrderDuration.GTC,
      status: OrderStatus.Pending,
      type: OrderType.Market,
    };
  }

  protected _emulateTrading() {
    this.subscribe(({ action, items: orders }) => {
      switch (action) {
        case RealtimeAction.Create:
          const closeOrderAndCreatePosition = (order: IOrder) => {
            this.closeOrder(order);

            (this._positionsRepository as any).createPositionFromOrder(order);
          };

          orders.forEach(order => {
            if (order.status !== OrderStatus.Pending) {
              return;
            }

            const callbacks = !(order as any).closePosition ? [
              closeOrderAndCreatePosition,
              this.closeOrder,
            ] : [
                this.closeOrder,
              ];

            this._processItem(order, callbacks);
          });

          break;
        case RealtimeAction.Update:
          this._declineItems(orders);
          break;
        case RealtimeAction.Delete:
          this._declineItems(orders);
          break;
      }
    });
  }
}
