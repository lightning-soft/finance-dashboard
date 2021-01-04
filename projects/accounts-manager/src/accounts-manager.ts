import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConnectionsRepository, IConnection } from 'trading';

@Injectable()
@UntilDestroy()
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
      .pipe(
        tap(() => this._updateConnections()),
      )
      .toPromise();
  }

  createConnection(connection: IConnection) {
    return this._connectionsRepository.createItem(connection)
      .pipe(
        tap(() => this._updateConnections()),
      );
  }

  rename(name, connection: IConnection) {
    return this._connectionsRepository.updateItem({...connection, name});
  }

  connect(connection: IConnection) {
    return this._connectionsRepository.connect(connection)
      .pipe(
        tap(() => this._updateConnections()),
      );
  }

  disconnect(connection: IConnection) {
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        tap(() => this._updateConnections()),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this._updateConnections();
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
        tap(() => this._updateConnections()),
      );
  }

  toggleFavourite(connection: IConnection) {
    return this._connectionsRepository.updateItem({ ...connection, favourite: !connection.favourite })
      .pipe(
        tap(() => this._updateConnections()),
      );
  }

  protected _updateConnections() {
    this._connectionsRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.connections.next(res.data));
  }
}
