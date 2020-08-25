import { IOrder } from '../../communication/trading/models';
import { FakeRepository } from '../common/fake.repository';

export class FakeOrdersRepository extends FakeRepository<IOrder> {
  protected async _getItems(): Promise<IOrder[]> {
    const array = [] as IOrder[];

    for (let i = 0; i < 100; i++) {
      array.push(
        {
          id: i,
          side: (i % 2 === 0) ? 'BUY' : 'SELL',
          price: 1.10538,
          priceIn: 1.10538,
          size: 0.000507551,
          executed: 0.000507551,
          symbol: 'BTCUSD',
          status: 'Open',
          type: 'Market'
        }
      );
    }

    return array;
  }
}
