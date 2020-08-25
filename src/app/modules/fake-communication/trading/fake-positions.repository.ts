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
          price: 11721.62,
          size: 2.132,
          realized: 1100,
          unrealized: 9500,
          total: 8400
        }
      );
    }

    return array;
  }
}
