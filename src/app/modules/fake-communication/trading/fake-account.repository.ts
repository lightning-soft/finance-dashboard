import {ExcludeId, Repository} from 'communication';
import {IAccount} from '../../communication/trading/models/account';
import {Observable, of} from 'rxjs';

export class FakeAccountRepository extends Repository<IAccount> {
  createItem(item: ExcludeId<IAccount>, options: any, projectId: number | undefined): Observable<IAccount> {
    return undefined;
  }

  deleteItem(id: number | string): Observable<boolean> {
    return undefined;
  }

  getItemById(id): Observable<IAccount> {
    return undefined;
  }

  getItems(params): Observable<IAccount[]> {
    return of([
      {name: 'CV', id: 1, connected: true, server: 'aaa', account: '+++++222'},
      {name: 'CV', id: 2, server: 'aaa', account: '+++++222'},
      {name: 'CV', id: 3, server: 'aaa', account: '+++++222'}

    ] as IAccount[]);
  }

  updateItem(item: IAccount): Observable<IAccount> {
    return undefined;
  }

}
