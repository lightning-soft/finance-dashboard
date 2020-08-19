import {ExcludeId, Repository} from '../../communication/common';
import {IOrder} from '../../communication/trading/models';
import {Observable, of} from 'rxjs';

const createTestItems = (count) => {
  const array = [] as IOrder[];

  for (let i = 0; i < count; i++) {
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
};

export class FakeOrdersRepository extends Repository<IOrder> {
  createItem(item: ExcludeId<IOrder>, options: any, projectId: number | undefined): Observable<IOrder> {
    return undefined;
  }

  deleteItem(id: number | string): Observable<boolean> {
    return undefined;
  }

  getItemById(id): Observable<IOrder> {
    return undefined;
  }

  getItems(params): Observable<IOrder[]> {
    return of(createTestItems(8));
  }

  updateItem(item: IOrder): Observable<IOrder> {
    return undefined;
  }

}
