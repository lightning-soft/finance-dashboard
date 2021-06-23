import { Inject, Injectable, Injector } from '@angular/core';
import { NumberHelper } from 'base-components';
import { RepositoryAction } from 'communication';
import { IOrder, IPosition, OrderDuration, OrderSide, OrderStatus, OrderType, PositionsRepository, Side } from 'trading';
import { FakeTradingRepository } from './fake-trading.repository';
import { throwError } from 'rxjs';
import { TradeHandler } from 'src/app/components';

const { randomFixedNumber } = NumberHelper;

@Injectable()
export class FakeOrdersRepository extends FakeTradingRepository<IOrder> {
  protected _positionsRepository: PositionsRepository;

  constructor(protected _injector: Injector,
              @Inject(TradeHandler) public tradeHandler: TradeHandler) {
    super();

    setTimeout(() => {
      this._positionsRepository = this._injector.get(PositionsRepository);

      this._emulateTrading();
    });
  }

  createItem(item: IOrder) {
    if (this.tradeHandler.tradingEnabled)
      return super.createItem({
        ...this._getItemSample(),
        ...item,
      });
    else {
      return throwError('You can\'t create order when trading is locked ');
    }

  }

  closeOrder(order: IOrder) {
    this.deleteItem(+order.id).subscribe();
    this.createItem({ ...order, status: OrderStatus.Canceled }).subscribe();
  }

  createOrderFromPosition(position: IPosition) {
    const order = {
      side: position.side === Side.Long ? OrderSide.Buy : OrderSide.Sell,
      quantity: position.size,
      symbol: position.accountId,
      duration: OrderDuration.GTC,
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
      account: {id: 'qwe'} as any,
      symbol: 'BTCUSD',
      exchange: null,
      side: (id % 2 === 0) ? OrderSide.Buy : OrderSide.Sell,
      quantity: 0.1,
      triggerPrice: randomFixedNumber(100),
      averageFillPrice: randomFixedNumber(100),
      filledQuantity: randomFixedNumber(100),
      instrument: {id} as any,
      // limitPrice: randomFixedNumber(100),
      // stopPrice: randomFixedNumber(100),
      duration: OrderDuration.GTC,
      status: OrderStatus.Pending,
      type: OrderType.Market,
      description: '',
      accountId: '',
    };
  }

  protected _emulateTrading() {
    this.actions.subscribe(({ action, items: orders }) => {
      switch (action) {
        case RepositoryAction.Create:
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
        case RepositoryAction.Update:
          this._declineItems(orders);
          break;
        case RepositoryAction.Delete:
          this._declineItems(orders);
          break;
      }
    });
  }
}
