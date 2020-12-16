import { Injectable } from '@angular/core';
import { Id } from 'base-components';
import { ExcludeId, HttpRepository, IPaginationResponse } from 'communication';
import { Observable, of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Broker, IConnection } from 'trading';

@Injectable()
export class RealConnectionsRepository extends HttpRepository<IConnection> {

  getItems(): Observable<IPaginationResponse<IConnection>> {
    const data = this._getItems();

    const res = { data } as IPaginationResponse<IConnection>;

    return of(res).pipe(delay(0));
  }

  createItem(item: ExcludeId<IConnection>): Observable<IConnection> {
    return of(this._createItem(item));
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
        this._updateItem(i);
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

  _getUrl(broker: Broker) {
    if (broker == null)
      throw new Error('Invalid broker');

    return this._communicationConfig[broker].http.url + 'Connection';
  }

  protected _createItem(item: ExcludeId<IConnection>): IConnection {
    const items = this._getItems().map(i => ({ ...i, connected: false }));

    const id = this._getLastId(items) + 1;
    const _item = { ...item, id } as IConnection;

    this._setItems([...items, _item]);

    this._onCreate(_item);

    if (items) {
      this._onUpdate(items);
    }

    return _item;
  }

  protected _updateItem(item: IConnection) {
    const items = this._getItems().map(i => {
      if (i.id === item.id) {
        const password = item.autoSavePassword ? item.password : null;

        return { ...i, ...item, password };
      }

      if (item.connected) {
        return { ...i, connected: false };
      }

      return i;
    });

    this._setItems(items);

    this._onUpdate(
      item.connected ? items : items.find(i => i.id === item.id)
    );
  }

  protected _deleteItem(id: Id): Observable<any> {
    const items = this._getItems().filter(i => i.id !== id);

    this._setItems(items);

    this._onDelete({ id });
    return of({ id });
  }

  protected _getItems(): IConnection[] {
    try {
      return JSON.parse(localStorage.getItem('connections')) || [];
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
