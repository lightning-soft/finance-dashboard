import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WebSocketService } from 'communication';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { ConnectionsRepository, IConnection } from 'trading';
import { HttpErrorInterceptor } from './interceptor';

@Injectable()
@UntilDestroy()
export class AccountsManager {
  connections = new BehaviorSubject<IConnection[]>([]);

  constructor(
    protected _connectionsRepository: ConnectionsRepository,
    private _webSocketService: WebSocketService,
    private _interceptor: HttpErrorInterceptor
  ) { }

  getActiveConnection() {
    return this.connections.value.find(i => i.connected);
  }

  async init() {
    this._webSocketService.on(this._handleStream.bind(this));
    this._interceptor.disconnectError.subscribe(() => this._deactivateConnection());
    this._updateConnections();

    return this.connections.pipe(
      take(2), // first default value
    ).toPromise();
  }

  private _handleStream(msg: any): void {
    if (msg?.type != 'Error')
      return;

    if (msg.result?.value == "No connection!") {
      this._deactivateConnection();
    }
  }

  private _deactivateConnection() {
    const connection = this.getActiveConnection();

    if (connection) {
      this._connectionsRepository.updateItem({ ...connection, connected: false })
        .pipe(tap(() => this._updateConnections()))
        .subscribe();
    }
  }

  createConnection(connection: IConnection) {
    return this._connectionsRepository.createItem(connection)
      .pipe(tap(() => this._updateConnections()));
  }

  rename(name, connection: IConnection) {
    return this._connectionsRepository.updateItem({ ...connection, name })
      .pipe(tap(() => this._updateConnections()));
  }

  connect(connection: IConnection) {
    return this._connectionsRepository.connect(connection)
      .pipe(tap(() => this._updateConnections()));
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
