import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WebSocketService } from 'communication';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
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
  ) {
  }

  getActiveConnection() {
    return this.connections.value.find(i => i.connected);
  }

  async init() {
    this._webSocketService.on(this._handleStream.bind(this));
    this._interceptor.disconnectError.subscribe(() => this._deactivateConnection());
    this._connectionsRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.connections.next(res.data));

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
        .pipe(tap(() => this.onUpdated({ ...connection, connected: false })))
        .subscribe();
    }
  }

  createConnection(connection: IConnection) {
    return this._connectionsRepository.createItem(connection)
      .pipe(tap((conn) => this.onCreated(conn)));
  }

  rename(name, connection: IConnection) {
    return this._connectionsRepository.updateItem({ ...connection, name })
      .pipe(tap(() => this.onUpdated({ ...connection, name })));
  }

  connect(connection: IConnection) {
    return this._connectionsRepository.connect(connection)
      .pipe(
        concatMap(item => {
          return this._connectionsRepository.updateItem(item)
            .pipe(map(_ => item));
        }),
        tap((conn) => this.onUpdated(conn)));
  }

  disconnect(connection: IConnection) {
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        tap(() => this.onUpdated({ ...connection, connected: false })),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.onUpdated(connection);
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
        tap(() => this.onDeleted({ id } as IConnection)),
      );
  }

  toggleFavourite(connection: IConnection) {
    return this._connectionsRepository.updateItem({ ...connection, favourite: !connection.favourite })
      .pipe(
        tap(() => this.onUpdated({ ...connection, favourite: !connection.favourite })),
      );
  }

  protected onCreated(connection: IConnection) {
    const connections = this.connections.value;
    if (!connection.name) {
      connection.name = `${connection.server}(${connection.gateway})`;
    }
    connections.push(connection);
    this.connections.next(connections);
  }

  protected onDeleted(connection: IConnection) {
    const connections = this.connections.value;
    this.connections.next(connections.filter(item => item.id !== connection.id));
  }

  protected onUpdated(connection: IConnection) {
    const connections = this.connections.value;
    const index = connections.findIndex(item => item.id === connection.id);
    connections[index] = connection;
    this.connections.next(connections);
  }
}
