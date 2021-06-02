import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { CommunicationConfig } from 'communication';
import { FakeRepository } from 'projects/communication/src/fake';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccountRepository, IAccount, IConnection } from 'trading';


// export class RealAccountRepository extends BaseRepository<IAccount> implements AccountRepository {
//   protected get suffix(): string {
//     return 'Account';
//   }

//   protected _mapResponseItem(item: any): IAccount {
//     return {
//       ...item,
//       connectionId: this.connection.id,
//     };
//   }
// }

@Injectable()
export class RealAccountRepository extends FakeRepository<IAccount> implements AccountRepository {
  protected _mapResponseItem(item: any): IAccount {
    return {
      ...item,
      connectionId: this.connection.id,
    };
  }

  constructor(
    @Inject(HttpClient) protected _http: HttpClient,
    @Optional() @Inject(CommunicationConfig) protected _communicationConfig: CommunicationConfig) {
    super()
  }

  async _getItems() {
    return [];
  }

  _loadAccounts(connection: IConnection) {
    return this._http.get(`${this._communicationConfig.rithmic.http.url}Account`, {
      headers: {
        'Api-Key': connection.connectionData.apiKey ?? '',
      },
    });
  }

  loadAccountsForConnection(connection: IConnection): Observable<any> {
    // this._store[connection.id] = connection;

    return this._loadAccounts(connection).pipe(tap(console.log))
  }
}
