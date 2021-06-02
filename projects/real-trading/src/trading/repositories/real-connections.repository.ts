import { Injectable } from '@angular/core';
import { Id } from 'base-components';
import { ExcludeId, HttpRepository, IPaginationResponse } from 'communication';
import { Observable, of } from 'rxjs';
import { catchError, delay, map, mergeMap, tap } from 'rxjs/operators';
import { AccountRepository, Broker, ConnectionsRepository, IConnection } from 'trading';
import { RealAccountRepository } from '.';

interface AccountSetting {
  id: string;
  name: string;
  login: string;
  password: string;
  metadata: any;
}

class Connection implements IConnection {
  broker: Broker;
  name: string;
  username: string;
  password?: string;
  server: string;
  aggregatedQuotes: boolean;
  gateway: string;
  autoSavePassword: boolean;
  connectOnStartUp: boolean;
  connected: boolean;
  favourite: boolean;
  connectionData: any;
  id: Id;

  constructor(connection: IConnection) {
    Object.assign(this, connection);
  }

  toString() {
    return this.name ?? `${this.server}(${this.gateway})`;
  }
}

@Injectable()
export class RealConnectionsRepository extends HttpRepository<IConnection> implements ConnectionsRepository {
  connections: IConnection[] = [];
  accountsRepo: RealAccountRepository;

  protected get _baseUrl(): string {
    return `${this._communicationConfig.rithmic.http.url}Connection`;
  }

  protected get _accountsSettings() {
    return `${this._communicationConfig.setting.url}api/AccountSettings`;
  }

  onInit() {
    this.accountsRepo = this._injector.get(AccountRepository) as any;
  }

  getItems(params: any): Observable<IPaginationResponse<IConnection>> {
    return this._http.get<AccountSetting[]>(this._accountsSettings, { ...this._httpOptions })
      .pipe(
        map(data => {
          return data.map(item => {
            const { metadata, ...rest } = item;
            return { ...metadata, ...rest } as IConnection;
          });
        }),
        map(data => {
          return { data, requestParams: params } as IPaginationResponse;
        })
      );
  }

  public deleteItem(id: Id): Observable<any> {
    return this._http.delete(this._accountsSettings, { params: { id: id as string } })
      .pipe(tap(() => this._onDelete({ id })));
  }

  getServers() {
    return super.getItems();
  }

  protected _responseToItems(res: any): any[] {
    return Object.keys(res.result)
      .map((name) => ({ gateways: res.result[name], name }));
  }

  updateItem(item: IConnection): Observable<IConnection> {
    return this._http.put<any>(this._accountsSettings, prepareItem(item, true), this._httpOptions)
      .pipe(tap(() => this._onUpdate(item)));
  }

  connect(item: IConnection): Observable<any> {
    return this._connect(item).pipe(
      mergeMap(i => {
        this._onUpdate(item);
        return this.accountsRepo._loadAccounts(item);
      }),
    );
  }

  disconnect(item: IConnection): Observable<any> {
    const _item = { ...item, connected: false, connectionData: null };

    return this._disconnect(item).pipe(
      map(() => _item),
      tap(() => this._onUpdate(item)),
    );
  }

  protected _connect(item: ExcludeId<IConnection>): Observable<any> {
    return this._http.post(this._getUrl(item.broker), item).pipe(
      map((res: any) => ({
        ...item,
        connected: true,
        error: false,
        connectionData: res.result,
      })),
      catchError(() => of({ ...item, error: true })),
    );
  }

  protected _disconnect(item: IConnection): Observable<any> {
    const data = item.connectionData;
    const apiKey = data.apiKey;

    return this._http.post(`${this._getUrl(item.broker)}/logout`, {}, {
      headers: {
        'Api-Key': apiKey,
      },
    });
  }

  // _getUrl(broker: Broker) {
  _getUrl(broker: any) {
    if (broker == null)
      throw new Error('Invalid broker');

    return this._communicationConfig[broker].http.url + 'Connection';
  }

  protected _createItem(item: ExcludeId<IConnection>, options?): Observable<IConnection> {
    return this._http.post<string>(this._accountsSettings, prepareItem(item))
      .pipe(
        map((id) => {
          return { ...item, id } as IConnection;
        })
      );
  }


}

function getPassword(item) {
  return item.autoSavePassword ? item.password : '';
}

function prepareItem(item, includeId = false) {
  let { password, name, id, ...metadata } = item;
  if (!name)
    name = `${item.server}(${item.gateway})`;
  password = getPassword(item);
  const data = {
    name,
    login: item.username,
    id,
    password,
    metadata
  };
  if (!includeId)
    delete data.id;
  return data;
}
