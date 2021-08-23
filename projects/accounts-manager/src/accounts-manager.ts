import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AlertType, ConenctionWebSocketService, Id, WSEventType } from 'communication';
import { NotificationService } from 'notification';
import { Sound, SoundService } from 'sound';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, mergeMap, tap } from 'rxjs/operators';
import { AccountRepository, ConnectionContainer, ConnectionsRepository, IAccount, IConnection } from 'trading';
// Todo: Make normal import
// The problem now - circular dependency
import { accountsListeners } from '../../real-trading/src/connection/accounts-listener';

@Injectable()
export class AccountsManager implements ConnectionContainer {

  private get _connections(): IConnection[] {
    return this.connectionsChange.value;
  }

  private set _connections(value: IConnection[]) {
    this.connectionsChange.next(value);
  }

  private __accounts: IAccount[] = [];

  private get _accounts(): IAccount[] {
    return this.__accounts;
  }

  private set _accounts(value: IAccount[]) {
    this.__accounts = value.filter((a, index, arr) => arr.findIndex(i => i.id === a.id) === index);
  }

  private _soundService: SoundService;

  private _wsIsOpened = false;
  private _wsHasError = false;
  private _accountsConnection = new Map();

  connectionsChange = new BehaviorSubject<IConnection[]>([]);

  constructor(
    protected _injector: Injector,
    private _connectionsRepository: ConnectionsRepository,
    private _accountRepository: AccountRepository,
    private _webSocketService: ConenctionWebSocketService,
    private _notificationService: NotificationService,
  ) {
    (window as any).accounts = this;
  }

  private _getSoundService(): any {
    if (!this._soundService) {
      this._soundService = this._injector.get(SoundService);
    }

    return this._soundService;
  }

  getConnectionByAccountId(accountId: Id): IConnection {
    if (!accountId)
      return null;

    return this._accountsConnection.get(accountId);
  }

  getAccountsByConnection(connId: Id) {
    return this._accounts.filter(item => item.connectionId === connId);
  }

  getConnection(connectionId: Id): IConnection {
    if (!connectionId)
      return null;

    for (const connection of this._accountsConnection.values()) {
      if (connection.id === connectionId)
        return connection;
    }

    return this._connections.find(item => item.id === connectionId);
  }

  async init(): Promise<IConnection[]> {
    await this._fetchConnections();
    for (const conn of this._connections.filter(i => i.connectOnStartUp))
      this.connect(conn).subscribe(
        () => console.log('Successfully conected', conn),
        (err) => console.error('Conected error', conn, err),
      );

    return this._connections;
  }

  private _fetchAccounts(connection: IConnection) {
    this._getAccountsByConnections(connection).then(accounts => {
      this._accounts = this._accounts.concat(accounts);

      for (const account of accounts) {
        this._accountsConnection.set(account.id, connection);
      }

      accountsListeners.notifyAccountsConnected(accounts, this._accounts);
    });
  }

  private async _fetchConnections(): Promise<void> {
    return this._connectionsRepository.getItems().toPromise().then(res => {
      this._connections = res.data.map(item => {
        item.connected = false;
        if (item.connected && !item.connectOnStartUp) {
          delete item.connectionData;
        }

        return item;
      });
    });
  }

  private async _getAccountsByConnections(connection: IConnection): Promise<IAccount[]> {
    if (!connection) {
      return Promise.resolve([]);
    }

    const params = {
      status: 'Active',
      criteria: '',
      connection,
    };

    return this._accountRepository.getItems(params)
      .pipe(catchError(e => {
        console.error('_getAccountsByConnections', e);
        return of({ data: [] } as any);
      }))
      .toPromise().then((i) => i.data);
  }

  private _initWS(connection: IConnection) {
    const webSocketService = this._webSocketService.get(connection);

    webSocketService.on(WSEventType.Message, this._wsHandleMessage.bind(this));
    webSocketService.on(WSEventType.Open, this._wsHandleOpen.bind(this));
    webSocketService.on(WSEventType.Error, this._wsHandleError.bind(this));

    webSocketService.connect();

    webSocketService.send({ type: 'Id', value: connection?.connectionData?.apiKey }, connection?.id);
  }

  private _closeWS(connection: IConnection) {
    const webSocketService = this._webSocketService.get(connection);

    webSocketService.destroy(connection);
  }

  private _wsHandleMessage(msg: any, connectionId: string): void {
    if (msg.type === 'Connect' && (
      msg.result.type === AlertType.ConnectionClosed ||
      msg.result.type === AlertType.ConnectionBroken ||
      msg.result.type === AlertType.ForcedLogout
    ) || msg.type === 'Error' && msg.result.value === 'No connection!') {
      this._deactivateConnection(connectionId);
    }
  }

  private _wsHandleOpen() {
    if (!this._wsIsOpened) {
      this._wsIsOpened = true;
      return;
    }

    this._wsHasError = false;

    this._notificationService.showSuccess('Connection restored.');
  }

  private _wsHandleError(event: ErrorEvent, connection: IConnection) {
    if (this._wsHasError) {
      return;
    }

    this._wsHasError = true;

    this._notificationService.showError('Connection lost. Check your internet connection.');

    if (connection?.connected) {
      this.onUpdated({
        ...connection,
        error: true,
      });
    }
  }

  private _deactivateConnection(connectionId: string): void {
    if (!connectionId) {
      return;
    }
    const connection = this._connections.find(item => item.id === connectionId);
    if (!connection) {
      return;
    }

    connection.connected = false;

    this._connectionsRepository.updateItem(connection)
      .pipe(tap(() => this.onUpdated(connection)))
      .subscribe();

  }

  createConnection(connection: IConnection): Observable<IConnection> {
    if (this._connections.some(hasConnection(connection)))
      return throwError('You can \'t create duplicated connection');

    return this._connectionsRepository.createItem(connection)
      .pipe(tap((conn) => this.onCreated(conn)));
  }

  updateItem(item: IConnection): Observable<IConnection> {
    return this._connectionsRepository.updateItem((item)).pipe(
      map(_ => item),
      tap((conn) => {
        this.onUpdated(conn);
      }),
    );
  }

  connect(connection: IConnection): Observable<IConnection> {
    const defaultConnection = this._connections.find(item => item.isDefault);
    return this._connectionsRepository.connect(connection)
      .pipe(
        concatMap(item => {
          item.isDefault = item?.id === defaultConnection?.id || defaultConnection == null;

          if (item.connected)
            this._getSoundService().play(Sound.CONNECTED);

          return this._connectionsRepository.updateItem((item)).pipe(
            map(_ => item),
            tap((conn) => {
              this.onUpdated(conn);
            }),
          );
        }),
        tap((conn) => {
          if (conn.connected) {
            this._initWS(conn);
            this._fetchAccounts(conn);
          }
        }),
        tap(() => accountsListeners.notifyConnectionsConnected([connection],
          this._connections.filter(i => i.connected)))
      );
  }

  private _onDisconnected(connection: IConnection) {
    const disconectedAccounts = this._accounts.filter(account => account.connectionId === connection.id);
    this._accounts = this._accounts.filter(account => account.connectionId !== connection.id);
    for (const account of disconectedAccounts) {
      this._accountsConnection.delete(account.id);
    }
    accountsListeners.notifyConnectionsDisconnected([connection], this._connections.filter(i => i.connected));
    accountsListeners.notifyAccountsDisconnected(disconectedAccounts, this._accounts);
    this._closeWS(connection);
    this._getSoundService().play(Sound.CONNECTION_LOST);
  }

  disconnectById(connectionId: string) {
    if (!connectionId)
      return;

    this.disconnect(this._connections.find(i => i.id === connectionId))
      .subscribe(
        i => console.log('Successfully disconnect'),
        err => console.error('Error disconnect ', err),
      );
  }

  disconnect(connection: IConnection): Observable<void> {
    if (!connection)
      return of();

    const updatedConnection = { ...connection, connected: false, isDefault: false, connectionData: null };

    return this._connectionsRepository.disconnect(connection)
      .pipe(
        concatMap(() => this._connectionsRepository.updateItem(updatedConnection)),
        tap(() => this.onUpdated(updatedConnection)),
        tap(() => this._onDisconnected(connection)),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.onUpdated(updatedConnection);
            return of(null);
          } else
            return throwError(err);
        })
      );
  }

  makeDefault(item: IConnection): Observable<any> | null {
    if (item.isDefault)
      return throwError('Connection is already default');

    const _connection = { ...item, isDefault: true };
    const defaultConnections = this._connections.filter(i => i.isDefault);

    const needUpdate = defaultConnections.map(i => ({ ...i, isDefault: false })).concat(_connection);

    return forkJoin(
      needUpdate.map(i => this._connectionsRepository.updateItem(i)
        .pipe(tap(() => this.onUpdated(i))))
    ).pipe(tap(() => this._onDefaultChanged(item)));
  }

  private _onDefaultChanged(item) {
    accountsListeners.notifyDefaultChanged(this._connections, item);
  }

  deleteConnection(connection: IConnection): Observable<any> {
    const { id } = connection;

    return (connection.connected ? this.disconnect(connection) : of(null))
      .pipe(
        mergeMap(() => this._connectionsRepository.deleteItem(id)),
        catchError((error) => {
          if (error.status === 401)
            return this._connectionsRepository.deleteItem(id);

          return throwError(error);
        }),
        tap(() => this._connections = this._connections.filter(i => i.id !== id)),
      );
  }

  toggleFavourite(connection: IConnection): Observable<IConnection> {
    const _connection = { ...connection, favourite: !connection.favourite };

    return this._connectionsRepository.updateItem(_connection)
      .pipe(
        tap(() => this.onUpdated(_connection)),
      );
  }

  protected onCreated(connection: IConnection): void {
    if (!connection.name) {
      connection.name = `${connection.server}(${connection.gateway})`;
    }

    this._connections = this._connections.concat(connection);
  }

  protected onUpdated(connection: IConnection): void {
    this._connections = this._connections.map(i => i.id === connection.id ? connection : i);
  }
}

function hasConnection(connection: IConnection) {
  return (conn: IConnection) => conn.username === connection.username && conn.server === connection.server;
}
