import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Id } from 'base-components';
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

  createConnection(connection: IConnection) {
    return this._connectionsRepository.createItem(connection)
      .pipe(
        tap((item: IConnection) => {
          this._createConnection(item);
        })
      );
  }

  connect(connection: IConnection) {
    return this._connectionsRepository.connect(connection)
      .pipe(
        tap((item: IConnection) => {
          this._updateConnection(item);
        })
      );
  }

  disconnect(connection: IConnection) {
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        tap((item: IConnection) => {
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

  deleteConnection(connection: IConnection) {
    const { id } = connection;

    return this._connectionsRepository.deleteItem(id)
      .pipe(
        tap(() => {
          this._deleteConnection(id);
        })
      );
  }

  toggleFavourite(connection: IConnection) {
    return this._connectionsRepository.updateItem({ ...connection, favourite: !connection.favourite })
      .pipe(
        tap((item: IConnection) => {
          this._updateConnection(item);
        })
      );
  }

  protected _createConnection(connection: IConnection) {
    if (!connection) return;

    this.connections.next([...this.connections.value, connection]);
  }

  protected _updateConnection(connection: IConnection) {
    if (!connection) return;

    const connections = this.connections.value.map(i => {
      return i.id === connection.id ? { ...i, ...connection } : i;
    });

    this.connections.next(connections);
  }

  protected _deleteConnection(id: Id) {
    this.connections.next(this.connections.value.filter(i => i.id !== id));
  }
}
