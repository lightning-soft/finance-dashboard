import { Injectable } from '@angular/core';
import { Id } from 'base-components';
import { ExcludeId, HttpRepository, IPaginationResponse } from 'communication';
import { Observable, of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Broker, IConnection } from 'trading';

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
export class RealConnectionsRepository extends HttpRepository<IConnection> {
  connections: IConnection[] = [];

  protected get _baseUrl(): string {
    return `${this._communicationConfig.rithmic.http.url}Connection`;
  }

  protected get _accountsSettings() {
    return `${this._communicationConfig.setting.url}api/AccountSettings`;
  }

  getItems(): Observable<IPaginationResponse<IConnection>> {
    return this._http.get<AccountSetting[]>(this._accountsSettings, { ...this._httpOptions })
      .pipe(
        map(data => {
          return data.map(item => {
            const { metadata, ...rest } = item;
            return { ...metadata, ...rest } as IConnection;
          });
        }),
        map(data => {
          console.warn(data);
          return { data } as IPaginationResponse;
        })
      );
  }

  public deleteItem(id: Id): Observable<any> {
    return this._http.delete(this._accountsSettings, this._httpOptions)
      .pipe(tap(() => this._onDelete({ id })));
  }

  getServers() {
    return super.getItems();
  }

  updateItem(item: IConnection): Observable<IConnection> {
    return this._http.put<any>(this._accountsSettings, item, this._httpOptions)
      .pipe(tap(() => this._onUpdate(item)));
  }

  connect(item: IConnection): Observable<any> {
    return this._connect(item).pipe(
      tap(i => {
        this._onUpdate(item);
        this._updateItem(i, false);
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
    const { ...metadata } = item;
    const login = item.username;
    const name = `${item.server}(${item.gateway})`;
    const password = this.getPassword(item);
    return this._http.post<AccountSetting>(this._accountsSettings, {
      name,
      login,
      password,
      metadata
    }).pipe(map(({ result }) => {
      const _item = { ...item, password, connectionData: result } as IConnection;
      return _item;
    }));
  }

  protected _updateItem(item: IConnection, makeDisconnected = true) {
  }

  getPassword(item) {
    return item.autoSavePassword ? item.password : '';
  }

}
