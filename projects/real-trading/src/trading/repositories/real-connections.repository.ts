import { Injectable } from '@angular/core';
import { Id } from 'base-components';
import { ExcludeId, HttpRepository, IPaginationResponse } from 'communication';
import { Observable, of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Broker, IConnection } from 'trading';

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
    Object.assign(this, connection)
  }

  toString() {
    return this.name ?? `${this.server}(${this.gateway})`;
  }
}

@Injectable()
export class RealConnectionsRepository extends HttpRepository<IConnection> {
  protected get _baseUrl(): string {
    return `${this._communicationConfig.rithmic.http.url}Connection`;
  }

  getItems(): Observable<IPaginationResponse<IConnection>> {
    const data = this._getItems();

    const res = { data } as IPaginationResponse<IConnection>;

    return of(res).pipe(delay(0));
  }

  getServers() {
    return super.getItems();
  }

  updateItem(item: IConnection): Observable<IConnection> {
    this._updateItem(item);

    return of(item);
  }

  deleteItem(id: Id): Observable<any> {
    // return throwError('Implement');

    return this._deleteItem(id);
  }

  connect(item: IConnection): Observable<any> {
    return this._connect(item).pipe(
      tap(i => {
        this._updateItem(i, false);
      }),
    );
  }

  disconnect(item: IConnection): Observable<any> {
    const _item = { ...item, connected: false, connectionData: null };

    return this._disconnect(item).pipe(
      map(() => _item),
      tap(() => this._updateItem(_item)),
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
    return super._createItem(item, options).pipe(map(({ result }) => {
      const items = this._getItems().map(i => ({ ...i, connected: false }));

      const id = this._getLastId(items) + 1;
      const password = this.getPassword(item);
      const _item = { ...item, password, connectionData: result, id } as IConnection;

      this._setItems([...items, _item]);

      return _item;
    }));
  }

  protected _updateItem(item: IConnection, makeDisconnected = true) {
    const items = this._getItems().map(i => {
      if (i.id === item.id) {
        const password = this.getPassword(item);

        return { ...i, ...item, password };
      }

      if (item.connected && makeDisconnected) {
        return { ...i, connected: false };
      }

      return i;
    });

    this._setItems(items);

    this._onUpdate(
      item.connected ? items : items.find(i => i.id === item.id)
    );
  }

  getPassword(item) {
    return item.autoSavePassword ? item.password : null;
  }

  protected _deleteItem(id: Id): Observable<any> {
    const items = this._getItems().filter(i => i.id !== id);

    this._setItems(items);

    this._onDelete({ id });
    return of({ id });
  }

  protected _getItems(): IConnection[] {
    try {
      const items = JSON.parse(localStorage.getItem('connections')) || [];
      if (!Array.isArray(items))
        return [];

      return items.map(i => new Connection(i))
    } catch {
      return [];
    }
  }

  protected _setItems(items: IConnection[]) {
    localStorage.setItem('connections', JSON.stringify(items));
  }

  protected _getLastId(items: IConnection[]) {
    const ids = items.map(i => +i.id);

    return Math.max(0, ...ids);
  }
}
