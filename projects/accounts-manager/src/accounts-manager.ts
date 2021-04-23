import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertType, WebSocketService } from 'communication';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';
import { ConnectionsRepository, IConnection } from 'trading';
import { HttpErrorInterceptor } from './interceptor';

@Injectable()
@UntilDestroy()
export class AccountsManager {
  private _activeConnection = new BehaviorSubject<IConnection>(null);
  private _connections = new BehaviorSubject<IConnection[]>([]);
  public activeConnection: Observable<IConnection> = this._activeConnection.asObservable();
  public connections: Observable<IConnection[]> = this._connections.asObservable();

  constructor(
    protected _connectionsRepository: ConnectionsRepository,
    private _webSocketService: WebSocketService,
    private _interceptor: HttpErrorInterceptor
  ) {
  }

  get items(): IConnection[] {
    return this._connections.value;
  }

  getActiveConnection(): IConnection {
    return this.items.find(i => i.connected);
  }

  updateConnectionClientState(connection: IConnection) {
    this.onUpdated(connection);
  }

  async init(): Promise<IConnection[]> {
    this._webSocketService.on(this._handleStream.bind(this));
    this._interceptor.disconnectError.subscribe(() => this._deactivateConnection());

    this.fetchConnections();

    return this.connections.pipe(
      take(2), // first default value
    ).toPromise();
  }

  fetchConnections() {
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
        this._connections.next(connections);
        this._activeConnection.next(this.getActiveConnection());
      });
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
      .pipe(tap(() => this.onUpdated({ ...connection, name }, false)));
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
        tap((conn) => this.onUpdated(conn, !conn.error)));
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
    if (!connection.name) {
      connection.name = `${connection.server}(${connection.gateway})`;
    }
    this._connections.next([...this.items, connection]);
    if (connection.connected) {
      this._activeConnection.next(connection);
    }
  }

  protected onDeleted(connection: IConnection): void {
    const connections = this.items.filter(i => i.id !== connection.id);
    this._connections.next(connections);
    if (connection.id === this.getActiveConnection().id) {
      this._activeConnection.next(null);
    }
  }

  protected onUpdated(connection: IConnection, emitActiveConnectionChange = true): void {
    const connections = this.items;
    const index = connections.findIndex(item => item.id === connection.id);
    connections[index] = connection;
    this._connections.next(connections);

    if (emitActiveConnectionChange) {
      this._activeConnection.next(connection.connected ? connection : null);
    }
  }
}
