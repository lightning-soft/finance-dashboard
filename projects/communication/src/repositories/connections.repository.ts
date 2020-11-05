import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { ExcludeId, IPaginationResponse } from '../common';
import { IConnection } from '../models';
import { BrokerRepository } from './broker.repository';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsRepository extends BrokerRepository<IConnection> {
  protected _itemName = 'Connection';

  getItems(): Observable<IPaginationResponse<IConnection>> {
    const data = this._getItems();

    const res = { data } as IPaginationResponse<IConnection>;

    return of(res).pipe(delay(0));
  }

  createItem(item: ExcludeId<IConnection>): Observable<IConnection> {
    return this._connect(item).pipe(
      tap(i => this._createItem(i)),
    );
  }

  connect(item: IConnection): Observable<any> {
    return this._connect(item).pipe(
      tap(i => this._updateItem(i)),
    );
  }

  disconnect(item: IConnection): Observable<any> {
    return this._http.post(`${this._baseUrl}logout`, {}, this._httpOptions).pipe(
      tap(() => {
        this._apiKey = null;

        this._updateItem({ ...item, connected: false });
      }),
    );
  }

  protected _connect(item: ExcludeId<IConnection>): Observable<any> {
    return this._http.post(this._getRESTURL(), item).pipe(
      tap((res: any) => {
        this._apiKey = res.result.apiKey;
      }),
      map(() => ({ ...item, password: null, connected: true })),
    );
  }

  protected _createItem(item: ExcludeId<IConnection>) {
    const items = this._getItems().map(i => ({ ...i, connected: false }));

    const id = this._getLastId(items) + 1;
    const _item = { ...item, id } as IConnection;

    this._setItems([...items, _item]);

    this._onCreate(_item);

    if (items) {
      this._onUpdate(items);
    }
  }

  protected _updateItem(item: IConnection) {
    const items = this._getItems().map(i => {
      if (i.id === item.id) {
        return { ...i, ...item };
      }

      if (item.connected) {
        return { ...i, conntected: false };
      }

      return i;
    });

    this._setItems(items);

    this._onUpdate(
      item.connected ? items : items.find(i => i.id === item.id)
    );
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
