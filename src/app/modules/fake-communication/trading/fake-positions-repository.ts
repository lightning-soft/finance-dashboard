import {ExcludeId, Repository} from '../../communication/common';
import {IPosition} from '../../communication/trading/models';
import {Observable, of} from 'rxjs';

const positions = [
  ...createTestItems(8)
] as IPosition[];

function createTestItems(count) {
  const array = [];
  for (let i = 0; i < count; i++) {
    array.push(
      {id: i, isLong: (i % 2 === 0), account: (i % 2 === 0) ? 'EURUSD' : 'BTCUSD',
        price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400}
    );
  }
  return array;
}

export class FakePositionsRepository extends Repository<IPosition> {
  createItem(item: ExcludeId<IPosition>, options: any, projectId: number | undefined): Observable<IPosition> {
    return undefined;
  }

  deleteItem(id: number | string): Observable<boolean> {
    return undefined;
  }

  getItemById(id): Observable<IPosition> {
    return undefined;
  }

  getItems(params): Observable<IPosition[]> {
    return of(positions);
  }

  updateItem(item: IPosition): Observable<IPosition> {
    return undefined;
  }

}
