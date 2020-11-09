import { Injectable } from '@angular/core';
import { ExcludeId, HttpRepository, IPaginationResponse } from 'communication';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { IConnection } from 'trading';

@Injectable()
export class RealConnectionsRepository extends HttpRepository<IConnection> {
  connection: BehaviorSubject<IConnection>;

  _apiKey;

  protected _itemName = 'Connection';

  onInit() {
    const connectedItem = this._getItems().find(i => i.connected);

    this.connection = new BehaviorSubject(connectedItem);
  }

  getItems(): Observable<IPaginationResponse<IConnection>> {
    const data = this._getItems();

    const res = { data } as IPaginationResponse<IConnection>;

    return of(res).pipe(delay(0));
  }

  createItem(item: ExcludeId<IConnection>): Observable<IConnection> {
    return this._connect(item).pipe(
      map(i => this._createItem(i)),
    );
  }

  updateItem(item: IConnection): Observable<IConnection> {
    this._updateItem(item);

    return of(item);
  }

  deleteItem(id: number): Observable<any> {
    return this._disconnect().pipe(
      catchError(() => of({ id })),
      tap(() => this._deleteItem(id)),
    );
  }

  connect(item: IConnection): Observable<any> {
    return this._connect(item).pipe(
      tap(i => {
        this._updateItem(i);
        this.connection.next(i);
      }),
    );
  }

  disconnect(item: IConnection): Observable<any> {
    const _item = { ...item, connected: false };

    return this._disconnect().pipe(
      tap(() => {
        this._updateItem(_item);
        this.connection.next(_item);
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

  protected _disconnect(): Observable<any> {
    return this._http.post(`${this._getRESTURL()}logout`, {}, this._httpOptions).pipe(
      tap(() => {
        this._apiKey = null;
      }),
    );
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
        return { ...i, ...item };
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

  protected _deleteItem(id: number) {
    const items = this._getItems().filter(i => i.id !== id);

    this._setItems(items);

    this._onDelete({ id });
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
