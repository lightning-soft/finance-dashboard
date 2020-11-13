import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPaginationResponse } from 'communication';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConnectionsRepository, IConnection } from 'trading';

@Injectable()
export class AccountsManager {
  connections = new BehaviorSubject<IConnection[]>([]);

  constructor(
    protected _connectionsRepository: ConnectionsRepository
  ) { }

  getActiveConnection() {
    return this.connections.value.find(i => i.connected);
  }

  async init() {
    return this._connectionsRepository.getItems()
      .pipe(tap((r: IPaginationResponse<IConnection>) => this.connections.next(r.data)))
      .toPromise();
  }

  protected _updateConnection(connection: IConnection) {
    if (!connection) return;

    const values = this.connections.value;
    const value = values.find(i => i.id === connection.id);

    if (!value) {
      values.unshift(connection);
    } else {
      Object.assign(value, connection);
    }

    this.connections.next(values);
  }

  createConnection(connection: IConnection) {
    return this._connectionsRepository.createItem(connection)
      .pipe(
        tap((item: any) => {
          this.connections.next([...this.connections.value, item]);
        })
      );
  }

  connect(connection: IConnection) {
    return this._connectionsRepository.connect(connection)
      .pipe(
        tap((item: any) => {
          this._updateConnection(item);
        })
      );
  }

  disconnect(connection: IConnection) {
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        tap((item: any) => {
          this._updateConnection(item);
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this._updateConnection({ ...connection, connected: false });
            return of(null);
          } else
            return throwError(err);
        })
      );
  }

  deleteConnection(item: IConnection) {
    return this._connectionsRepository.deleteItem(+item.id)
      .pipe(
        tap(() => {
          this.connections.next(this.connections.value.filter(i => i.id !== item.id));
        })
      );

  }

  toggleFavourite(item: IConnection) {
    return this._connectionsRepository.updateItem({ ...item, favourite: !item.favourite })
      .pipe(
        tap((item: any) => {
          this._updateConnection(item);
        })
      );
  }
}
