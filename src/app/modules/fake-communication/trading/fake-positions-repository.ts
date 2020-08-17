import {ExcludeId, Repository} from '../../communication/common';
import {IPosition} from '../../communication/trading/models';
import {Observable, of} from 'rxjs';

const positions = [
  {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'BTCUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},

  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},


  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},
  {account: 'EURUSD', price: 11721.62, size: 2.132, realized: 1100, unrealized: 9500, total: 8400},


] as IPosition[];

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
