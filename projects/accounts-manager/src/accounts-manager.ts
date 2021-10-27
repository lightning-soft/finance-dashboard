import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AlertType, ConenctionWebSocketService, Id, WSEventType } from 'communication';
import { NotificationService } from 'notification';
import { Sound, SoundService } from 'sound';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, debounceTime, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';
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

  private _wsIsOpened = {};
  private _wsHasError = {};
  private _accountsConnection = new Map();

  connectionsChange = new BehaviorSubject<IConnection[]>([]);

  private _updateConnectionsMap: { [key: string]: BehaviorSubject<IConnection> } = {};
  private _requests: { [key: string]: Observable<IConnection> } = {};

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
        () => console.log('Successfully connected', conn),
        (err) => console.error('Connected error', conn, err),
      );

    return this._connections;
  }

  private _fetchAccounts(connection: IConnection) {
    this._getAccountsByConnections(connection)
      .then(accounts => {
        this._accounts = this._accounts.concat(accounts);

        for (const account of accounts) {
          this._accountsConnection.set(account.id, connection);
        }

        accountsListeners.notifyAccountsConnected(accounts, this._accounts);
      })
      .catch(() => {
        this.disconnect(connection);
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
    const subscription = webSocketService.reconnection$.pipe(
      // switchMap((conn) => this.reconnect(conn))
    )
      .subscribe(
        (conn) => {
          this._notificationService.showSuccess('Reconnected');
        },
        (err) => {
          this._notificationService.showError(err, 'Error during reconnection');
        },
        () => subscription.unsubscribe());

    webSocketService.on(WSEventType.Message, this._wsHandleMessage.bind(this));
    webSocketService.on(WSEventType.Open, this._wsHandleOpen.bind(this));
    webSocketService.on(WSEventType.Error, this._wsHandleError.bind(this));
    webSocketService.on(WSEventType.Close, this._wsHandleClose.bind(this));

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

  private _wsHandleOpen(event, connectionId) {
    if (!this._wsIsOpened[connectionId]) {
      this._wsIsOpened[connectionId] = true;
      const conn = this._connections.find(item => item.id === connectionId);
      this._wsHasError[connectionId] = false;
      this._notificationService.showSuccess(`Connection ${conn?.name ?? ''} restored.`);
    }
  }

  private _wsHandleError(event: ErrorEvent, connectionId) {
    delete this._wsIsOpened[connectionId];

    if (this._wsHasError[connectionId] === true) {
      return;
    }

    this._wsHasError[connectionId] = true;
    console.log('ws error', event, connectionId);
    this._notificationService.showError(event, 'Connection lost. Check your internet connection.');

    // if (connection?.connected) {
    //   this.onUpdated({
    //     ...connection,
    //     error: true,
    //   });
    // }
  }

  private _wsHandleClose(event, connId) {
    delete this._wsIsOpened[connId];
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

    this.updateItem(connection)
      .pipe(
        tap(() => this._onDisconnected(connection)),
        tap(() => this.onUpdated(connection))
      ).subscribe(
        () => console.log('Successfully deactivate'),
        (err) => console.error('Deactivate error ', err),
      );
  }

  createConnection(connection: IConnection): Observable<IConnection> {
    if (this._connections.some(hasConnection(connection)))
      return throwError('You can \'t create duplicated connection');

    return this._connectionsRepository.createItem(connection)
      .pipe(tap((conn) => this.onCreated(conn)));
  }

  updateItem(item: IConnection): Observable<IConnection> {
    if (this._updateConnectionsMap[item.id] == null) {
      const id = item.id;
      const clear = () => {
        const sub = this._updateConnectionsMap[id];
        if (!sub)
          return;

        sub.complete();
        delete this._requests[id];
        delete this._updateConnectionsMap[id];
      };

      const subject = new BehaviorSubject<any>(item);
      this._updateConnectionsMap[id] = subject;
      this._requests[id] = subject.pipe(
        debounceTime(50),
        switchMap((i) => this._connectionsRepository.updateItem((i))),
        map(() => subject.value),
        tap((i) => this.onUpdated(i)),
        shareReplay(),
        tap(clear),
        catchError(err => {
          clear();
          return throwError(err);
        }),
      );
    }

    this._updateConnectionsMap[item.id].next(item);

    return this._requests[item.id];
  }

  connect(connection: IConnection): Observable<IConnection> {
    const defaultConnection = this._connections.find(item => item.isDefault);
    return this._connectionsRepository.connect(connection)
      .pipe(
        concatMap(item => {
          item.isDefault = item?.id === defaultConnection?.id || defaultConnection == null;

          if (item.connected) {
            item.error = false;
          }

          if (item.error) {
            this._notificationService.showError(item.err, 'Connection error');
          }

          return this.updateItem((item));
        }),
        tap((conn) => {
          if (conn.connected) {
            this._initWS(conn);
            this._fetchAccounts(conn);
            this._getSoundService().play(Sound.CONNECTED);
          }
        }),
        tap(() => accountsListeners.notifyConnectionsConnected([connection],
          this._connections.filter(i => i.connected)))
      );
  }

  private _onDisconnected(connection: IConnection) {
    const disconnectedAccounts = this._accounts.filter(account => account.connectionId === connection.id);
    this._accounts = this._accounts.filter(account => account.connectionId !== connection.id);
    for (const account of disconnectedAccounts) {
      this._accountsConnection.delete(account.id);
    }
    accountsListeners.notifyConnectionsDisconnected([connection], this._connections.filter(i => i.connected));
    accountsListeners.notifyAccountsDisconnected(disconnectedAccounts, this._accounts);
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
    console.log('disconnect', connection);
    if (!connection || !connection.connected)
      return of();

    const updatedConnection = { ...connection, connected: false, isDefault: false, connectionData: null };

    return this._connectionsRepository.disconnect(connection)
      .pipe(
        concatMap(() => this.updateItem(updatedConnection)),
        tap(() => {
          this._onDisconnected(connection);
          if (connection.error)
            this._notificationService.showError(connection.err, 'Connection is closed');
          else
            this._notificationService.showSuccess('Connection is closed');
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.message === 'No connection!')
            this._onDisconnected(connection);

          if (err.status === 401) {
            this.onUpdated(updatedConnection);
            this._onDisconnected(updatedConnection);
            return of(null);
          } else
            return throwError(err);
        })
      );
  }

  reconnect(connection: IConnection) {
    return this.disconnect(connection)
      .pipe(switchMap(item => this.connect(connection)));
  }

  makeDefault(item: IConnection): Observable<any> | null {
    if (item.isDefault)
      return throwError('Connection is already default');

    const _connection = { ...item, isDefault: true };
    const defaultConnections = this._connections.filter(i => i.isDefault);

    const needUpdate = defaultConnections.map(i => ({ ...i, isDefault: false })).concat(_connection);

    return forkJoin(needUpdate.map(i => this.updateItem(i)))
      .pipe(tap(() => this._onDefaultChanged(item)));
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

    return this.updateItem(_connection);
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
