import { Injectable, Injector } from '@angular/core';
import { NumberHelper } from 'base-components';
import { IOrder, IPosition, OrderSide, OrdersRepository, PositionStatus, Side } from 'trading';
import { FakeTradingRepository } from './fake-trading.repository';

const { randomFixedNumber } = NumberHelper;

@Injectable()
export class FakePositionsRepository extends FakeTradingRepository<IPosition> {
  protected _ordersRepository: OrdersRepository;

  constructor(protected _injector: Injector) {
    super();

    setTimeout(() => {
      this._ordersRepository = this._injector.get(OrdersRepository);
    });
  }

  createItem(item: IPosition) {
    return super.createItem({
      ...this._getItemSample(),
      ...item,
    });
  }

  deleteItem(id: number) {
    this.closePosition(id);

    return super.deleteItem(id);
  }

  deleteMany(params: any) {
    for (const id of params.ids)
      this.closePosition(id);

    return super.deleteMany(params);
  }

  closePosition(id: number) {
    const position = this._store[id];

    if (position) {
      this.createItem({ ...position, status: PositionStatus.Close }).subscribe();

      (this._ordersRepository as any).createOrderFromPosition(position);
    }
  }

  createPositionFromOrder(order: IOrder) {
    const position = {
      side: order.side === OrderSide.Sell ? Side.Short : Side.Long,
      accountId: order.instrument.symbol,
      size: order.quantity,
    } as IPosition;

    this.createItem(position).subscribe();
  }

  protected itemsFilter(position: IPosition) {
    const { status, instrument } = this._getItemsParams;

    return (!status || status === position.status)
      && (!instrument || instrument.symbol === position.accountId);
  }

  protected async _getItems(): Promise<IPosition[]> {
    return [];

    // return Array.from({ length: 100 }, () => this._getItemSample());
  }

  protected _getItemSample(): IPosition {
    const id = this._id;

    return {
      id,
      connectionId: '',
      side: (id % 2 === 0) ? Side.Long : Side.Short,
      accountId: (id % 2 === 0) ? 'EURUSD' : 'BTCUSD',
      price: randomFixedNumber(100),
      size: randomFixedNumber(),
      buyVolume: randomFixedNumber(),
      sellVolume: randomFixedNumber(),
      realized: randomFixedNumber(),
      unrealized: randomFixedNumber(),
      total: randomFixedNumber(),
      status: PositionStatus.Open,
      instrument: { id: 'tt' } as any,
    };
  }
}
