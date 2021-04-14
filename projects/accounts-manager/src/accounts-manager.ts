import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertType, WebSocketService } from 'communication';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
import { ConnectionsRepository, IConnection } from 'trading';
import { HttpErrorInterceptor } from './interceptor';

interface IConnectionsData {
  connections: IConnection[];
  needUpdateConnection: boolean;
}

@Injectable()
@UntilDestroy()
export class AccountsManager {
  private _connectionsData = new BehaviorSubject<IConnectionsData>({ connections: [], needUpdateConnection: false });
  public connectionsData = this._connectionsData.asObservable();

  constructor(
    protected _connectionsRepository: ConnectionsRepository,
    private _webSocketService: WebSocketService,
    private _interceptor: HttpErrorInterceptor
  ) {
  }

  getActiveConnection(): IConnection {
    return this._connectionsData.value.connections.find(i => i.connected);
  }

  async init(): Promise<IConnectionsData> {
    this._webSocketService.on(this._handleStream.bind(this));
    this._interceptor.disconnectError.subscribe(() => this._deactivateConnection());
    this._connectionsRepository.getItems()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const connections: IConnection[] = res.data.map(item => {
          if (item.connected && !item.connectOnStartUp) {
            item.connected = false;
            delete item.connectionData;
          }
          return item;
        });
        this._connectionsData.next({ connections, needUpdateConnection: true });
      });

    return this.connectionsData.pipe(
      take(2), // first default value
    ).toPromise();
  }

  private _handleStream(msg: any): void {
    if (msg?.type === 'Connect' && (
      msg.result.type === AlertType.ConnectionClosed ||
      msg.result.type === AlertType.ConnectionBroken ||
      msg.result.type === AlertType.ForcedLogout))
      this._deactivateConnection();
    if (msg?.type != 'Error')
      return;
    if (msg.result?.value == 'No connection!') {
      this._deactivateConnection();
    }
  }

  private _deactivateConnection(): void {
    const connection = this.getActiveConnection();
    if (connection) {
      this._connectionsRepository.updateItem({ ...connection, connected: false })
        .pipe(tap(() => this.onUpdated({ ...connection, connected: false })))
        .subscribe();
    }
  }

  createConnection(connection: IConnection): Observable<IConnection> {
    return this._connectionsRepository.createItem(connection)
      .pipe(tap((conn) => this.onCreated(conn)));
  }

  rename(name, connection: IConnection): Observable<IConnection> {
    return this._connectionsRepository.updateItem({ ...connection, name })
      .pipe(tap(() => this.onUpdated({ ...connection, name })));
  }

  connect(connection: IConnection): Observable<IConnection> {
    const oldConnection = this.getActiveConnection();
    return this._connectionsRepository.connect(connection)
      .pipe(
        concatMap(item => {
          if (oldConnection && !item.error)
            return this.disconnect(oldConnection)
              .pipe(
                map(conn => item)
              );
          return of(item);
        }),
        concatMap(item => {
          return this._connectionsRepository.updateItem(item)
            .pipe(map(_ => item));
        }),
        tap((conn) => this.onUpdated(conn)));
  }

  disconnect(connection: IConnection): Observable<void> {
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        map(() => ({ ...connection, connected: false })),
        tap((updatedConnection) => this.onUpdated(updatedConnection)),
        concatMap((updatedConnection) => this._connectionsRepository.updateItem(updatedConnection)),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.onUpdated(connection);
            return of(null);
          } else
            return throwError(err);
        })
      );
  }

  deleteConnection(connection: IConnection): Observable<any> {
    const { id } = connection;

    return this._connectionsRepository.deleteItem(id)
      .pipe(
        tap(() => this.onDeleted({ id } as IConnection)),
      );
  }

  toggleFavourite(connection: IConnection): Observable<IConnection> {
    return this._connectionsRepository.updateItem({ ...connection, favourite: !connection.favourite })
      .pipe(
        tap(() => this.onUpdated({ ...connection, favourite: !connection.favourite }, false)),
      );
  }

  protected onCreated(connection: IConnection): void {
    const connections = this._connectionsData.value.connections;
    if (!connection.name) {
      connection.name = `${connection.server}(${connection.gateway})`;
    }
    connections.push(connection);
    this._connectionsData.next({ connections, needUpdateConnection: true });
  }

  protected onDeleted(connection: IConnection): void {
    const connections = this._connectionsData.value.connections;
    this._connectionsData.next(
      {
        connections: connections.filter(item => item.id !== connection.id),
        needUpdateConnection: this.getActiveConnection()?.id === connection.id
      })
  }

  protected onUpdated(connection: IConnection, needUpdateConnection = true): void {
    const connections = this._connectionsData.value.connections;
    const index = connections.findIndex(item => item.id === connection.id);
    connections[index] = connection;
    this._connectionsData.next({ connections, needUpdateConnection });
  }
}
