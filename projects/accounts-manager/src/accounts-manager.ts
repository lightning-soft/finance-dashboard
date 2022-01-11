import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AlertType, ConenctionWebSocketService, Id, WSEventType } from 'communication';
import { NotificationService } from 'notification';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { Sound, SoundService } from 'sound';
import { AccountRepository, Broker, ConnectionContainer, ConnectionsRepository, IAccount, IConnection } from 'trading';
// Todo: Make normal import
// The problem now - circular dependency
import { accountsListeners } from '../../real-trading/src/connection/accounts-listener';

export class Connection implements IConnection {
  broker: Broker;
  name: string;
  username: string;
  password?: string;
  server: string;
  aggregatedQuotes: boolean;
  gateway: string;
  autoSavePassword: boolean;
  connectOnStartUp: boolean;
  private _connected: boolean;

  public get connected(): boolean {
    return this._connected;
  }

  public set connected(value: boolean) {
    console.log('connected', this._connected);
    if (value)
      this.err = null;

    this._connected = value;
  }
  favourite: boolean;
  isDefault: boolean;

  err?: any;
  connectionData: any;
  id: Id;

  get error(): boolean {
    return this.err != null;
  }

  get canConnectOnStartUp() {
    return this.connectOnStartUp && this.password && this.password !== '';
  }

  private _loadingCount = 0;

  get loading(): boolean {
    return this._loadingCount > 0;
  }

  constructor(private _connectionsRepository: ConnectionsRepository) {

  }

  create(): Observable<IConnection> {
    if (!this.name) {
      this.name = `${this.server}(${this.gateway})`;
    }

    return this._connectionsRepository.createItem(this.toJson());
  }

  makeDefault(isDefault = true): any {
    this.isDefault = !this.isDefault;
    return this._connectionsRepository.updateItem(this.toJson()).pipe(map(() => null));
  }

  toggleFavorite(): Observable<any> {
    this.favourite = !this.favourite;
    return this._connectionsRepository.updateItem(this.toJson()).pipe(map(() => null));
  }

  reconnect() {
    return this.disconnect().pipe(switchMap(item => this.connect()));
  }

  connect(makeDefault: boolean = false): Observable<this> {
    const fn = this._makeLoading();

    if (makeDefault === true)
      this.isDefault = true;

    const connection = this.toJson();
    return this._connectionsRepository.connect(connection)
      .pipe(
        finalize(fn),
        tap((item) => {
          console.log('connect', item);

          this._handleConnection(item);
        }),
        map(() => this),
      );
  }

  disconnect(): Observable<void> {
    if (!this.connected || this.loading)
      return of();

    const fn = this._makeLoading();
    const connection = this.toJson();
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        finalize(fn),
        // concatMap(() => this.updateItem(updatedConnection)),
        // tap(() => {
        //   // this._onDisconnected(connection);
        //   if (connection.error)
        //     this._notificationService.showError(connection.err, 'Connection is closed');
        //   else
        //     this._notificationService.showSuccess('Connection is closed');
        // }),
        catchError((err: HttpErrorResponse) => {
          const disconnectedConnection = { ...connection, connected: false, err: null };
          const message = err.message.toLowerCase();
          if (message.includes('no connection') || message.includes('invalid api key'))
            return of(disconnectedConnection);
          // this._onDisconnected(connection);

          if (err.status === 401) {
            // this.onUpdated(updatedConnection);
            // this._onDisconnected(updatedConnection);
            return of(disconnectedConnection);
          } else
            return throwError(err);
        }),
        tap((item) => {
          this._handleConnection(item);
        }),
      );
  }

  private _handleConnection(item) {
    this.err = item.err;
    this.connected = item.connected;
    this.connectionData = item.connectionData;
  }

  private _makeLoading(): () => void {
    this._loadingCount++;
    console.log('_makeLoading increase', this.id, this._loadingCount);
    return () => {
      console.log('_makeLoading decrease', this.id, this._loadingCount);

      this._loadingCount--;
    };
  }

  fromJson(json: any): this {
    if (json == null)
      return;

    delete json.error;
    delete json.loading;
    delete json.connected;
    delete json.connectOnStartUp;
    // delete json.err;
    // if (json.connected)
    //   delete json.err;
    Object.assign(this, json);

    return this;
  }

  applyJson(json: any) {
    if (json == null)
      return;

    // delete json.error;
    // delete json.loading;
    // delete json.err;
    // if (json.connected)
    //   delete json.err;
    Object.assign(this, json);
  }

  toJson(): any {
    return {
      broker: this.broker,
      name: this.name,
      username: this.username,
      password: this.password,
      server: this.server,
      aggregatedQuotes: this.aggregatedQuotes,
      gateway: this.gateway,
      autoSavePassword: this.autoSavePassword,
      connectOnStartUp: this.connectOnStartUp,
      connected: this.connected,
      favourite: this.favourite,
      isDefault: this.isDefault,
      error: this.error,
      err: this.err,
      connectionData: this.connectionData,
      id: this.id,
    };
  }
}

@Injectable()
export class AccountsManager implements ConnectionContainer {

  get connections(): Connection[] {
    return this.connectionsChange.value;
  }

  private get _connections(): Connection[] {
    return this.connectionsChange.value;
  }

  private set _connections(value: Connection[]) {
    this.connectionsChange.next(value);
  }

  // tslint:disable-next-line:variable-name
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

  connectionsChange = new BehaviorSubject<Connection[]>([]);

  // private _updateConnectionsMap: { [key: string]: BehaviorSubject<IConnection> } = {};
  // private _requests: { [key: string]: Observable<IConnection> } = {};

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
    setTimeout(async () => {
      await this._fetchConnections();
      for (const conn of this._connections.filter(i => i.canConnectOnStartUp).sort(i => i.isDefault ? -1 : 1))
        this.connect(conn).subscribe(
          () => console.log('Successfully connected', conn),
          (err) => console.error('Connected error', conn, err),
        );

      return this._connections;
    }, 1000);

    return [];
  }

  private _fetchAccounts(connection: Connection) {
    this._getAccountsByConnections(connection)
      .then(accounts => {
        this._accounts = this._accounts.concat(accounts);

        for (const account of accounts) {
          this._accountsConnection.set(account.id, connection);
        }

        accountsListeners.notifyAccountsConnected(accounts, this._accounts);
      })
      .catch((e) => {
        console.error('error', e);
        this.disconnect(connection).subscribe();
      });
  }

  private async _fetchConnections(): Promise<void> {
    return this._connectionsRepository.getItems().toPromise().then(res => {
      this._connections = res.data.map(item => {
        // TODO: Move to constructor|from json if possible
        item.connected = false;
        if (item.connected && !item.connectOnStartUp) {
          delete item.connectionData;
        }

        return this.getNewConnection(item);
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

  private _initWS(connection: Connection) {
    const webSocketService = this._webSocketService.get(connection);
    const subscription = webSocketService.reconnection$
      .pipe(switchMap(() => connection.reconnect()))
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
    ) || msg.type === 'Error' && msg.result.value.toLowerCase().includes('no connection')) {
      this._deactivateConnection(connectionId);
    }
  }

  private _wsHandleOpen(event, connectionId) {
    if (!this._wsIsOpened[connectionId]) {
      this._wsIsOpened[connectionId] = true;
      const conn = this._connections.find(item => item.id === connectionId);
      this._wsHasError[connectionId] = false;
      this._notificationService.showSuccess(`Connection ${conn?.name ?? ''} opened.`);
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

    // connection.connected = false;
    connection.disconnect()
      .pipe(
        tap(() => this._onDisconnected(connection)),
      ).subscribe(
        () => console.log('Successfully deactivate'),
        (err) => console.error('Deactivate error ', err),
      );
    // this.updateItem(connection)
    //   .pipe(
    //     tap(() => this._onDisconnected(connection)),
    //     // tap(() => this.onUpdated(connection))
    //   ).subscribe(
    //     () => console.log('Successfully deactivate'),
    //     (err) => console.error('Deactivate error ', err),
    //   );
  }

  createConnection(connection: Connection): Observable<IConnection> {
    if (this._connections.some(hasConnection(connection)))
      return throwError('You can \'t create duplicated connection');

    return connection.create()
      .pipe(tap(() => this._connections = this._connections.concat(connection)));

    // return this._connectionsRepository.createItem(connection)
    //   .pipe(tap((conn) => this.onCreated(conn)));
  }

  // updateItem(item: IConnection): Observable<IConnection> {
  //   if (this._updateConnectionsMap[item.id] == null) {
  //     item.loading = true;
  //     const id = item.id;
  //     const clear = () => {
  //       const sub = this._updateConnectionsMap[id];
  //       if (!sub)
  //         return;

  //       sub.complete();
  //       this._setLoading(item, false);
  //       delete this._requests[id];
  //       delete this._updateConnectionsMap[id];
  //     };

  //     const subject = new BehaviorSubject<any>(item);
  //     this._updateConnectionsMap[id] = subject;
  //     this._requests[id] = subject.pipe(
  //       tap(() => this._setLoading(item)),
  //       debounceTime(50),
  //       switchMap((i) => this._connectionsRepository.updateItem((i))),
  //       map(() => subject.value),
  //       tap((i) => this.onUpdated({ ...i, loading: false })),
  //       shareReplay(),
  //       tap(clear),
  //       catchError(err => {
  //         clear();
  //         return throwError(err);
  //       }),
  //     );
  //   }

  //   this._updateConnectionsMap[item.id].next(item);

  //   return this._requests[item.id];
  // }

  connect(connection: Connection): Observable<IConnection> {
    const defaultConnection = this._connections.find(item => item.isDefault);
    return connection.connect(defaultConnection == null)
      .pipe(
        // concatMap(item => {
        //   item.isDefault = item?.id === defaultConnection?.id || defaultConnection == null;

        //   if (item.connected) {
        //     item.error = false;
        //   }

        //   if (item.error) {
        //     this._notificationService.showError(item.err, 'Connection error');
        //   }
        //   this._setLoading(item);
        //   return this.updateItem((item));
        // }),
        tap((conn) => {
          if (conn.error) {
            this._notificationService.showError(conn.err, 'Connection error');
          }

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

  disconnect(connection: Connection): Observable<void> {
    console.log('disconnect', connection);
    if (!connection || !connection.connected)
      return of();

    return connection.disconnect()
      .pipe(
        tap(() => {
          this._onDisconnected(connection);
          if (connection.error)
            this._notificationService.showError(connection.err, 'Connection is closed');
          else
            this._notificationService.showSuccess('Connection is closed');
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.message.toLowerCase().includes('no connection'))
            this._onDisconnected(connection);

          if (err.status === 401) {
            // this.onUpdated(updatedConnection);
            this._onDisconnected(connection);
            return of(null);
          } else
            return throwError(err);
        })
      );
  }

  makeDefault(item: Connection): Observable<any> | null {
    if (item.isDefault)
      return throwError('Connection is already default');

    // const _connection = { ...item, isDefault: true };
    const defaultConnections = this._connections.filter(i => i.isDefault);
    if (defaultConnections == null || defaultConnections.includes(item)) {
      return of(item);
    }

    return forkJoin(defaultConnections.map(i => i.makeDefault(false)).concat(item.makeDefault()))
      .pipe(tap(() => this._onDefaultChanged(item)));

    // const needUpdate = defaultConnections.map(i => ({ ...i, isDefault: false })).concat(_connection);
  }

  private _onDefaultChanged(item) {
    accountsListeners.notifyDefaultChanged(this._connections, item);
    this._triggerConnectionsChange();
  }

  deleteConnection(connection: Connection): Observable<any> {
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

  toggleFavorite(connection: Connection): Observable<void> {
    return connection.toggleFavorite().pipe(tap(this._triggerConnectionsChange));
  }

  getNewConnection(item = {}): Connection {
    return new Connection(this._connectionsRepository).fromJson(item);
  }

  private _triggerConnectionsChange = () => this.connectionsChange.next(this.connections);
}

function hasConnection(connection: IConnection) {
  return (conn: IConnection) => conn.username === connection.username
    && conn.server === connection.server
    && conn.gateway === connection.gateway;
}
