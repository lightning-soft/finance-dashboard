import { IPosition, Side } from '../../communication/trading/models';
import { FakeRepository } from '../common/fake.repository';

export class FakePositionsRepository extends FakeRepository<IPosition> {
  protected async _getItems(): Promise<IPosition[]> {
    const array = [];

    for (let i = 0; i < 100; i++) {
      array.push(
        {
          id: i,
          side: (i % 2 === 0) ? Side.Long : Side.Short,
          account: (i % 2 === 0) ? 'EURUSD' : 'BTCUSD',
          price: +(Math.random() * 100).toFixed(3),
          size: +(Math.random() * 10).toFixed(3),
          realized: +(Math.random() * 10).toFixed(3),
          unrealized: +(Math.random() * 10).toFixed(3),
          total: +(Math.random() * 10).toFixed(3),
        }
      );
    }

    return array;
  }
}
