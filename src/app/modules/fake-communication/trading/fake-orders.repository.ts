import {IOrder, OrderSide, OrderStatus, OrderType} from '../../trading/trading/models'; //Error
import {FakeRepository} from '../common/fake.repository';

export class FakeOrdersRepository extends FakeRepository<IOrder> {
  protected async _getItems(): Promise<IOrder[]> {
    const array = [] as IOrder[];

    for (let i = 0; i < 100; i++) {
      array.push(
        {
          id: i,
          side: (i % 2 === 0) ? OrderSide.Buy : OrderSide.Sell,
          price: 1.10538,
          priceIn: 1.10538,
          size: 0.000507551,
          executed: 0.000507551,
          symbol: 'BTCUSD',
          status: (i % 2 === 0) ? OrderStatus.Open : OrderStatus.Close,
          type: OrderType.Market
        }
      );
    }

    return array;
  }
}
