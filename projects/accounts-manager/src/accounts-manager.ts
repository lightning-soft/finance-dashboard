import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { IPaginationResponse } from 'base-components';
import { AlertType, IBaseItem, WebSocketService, WSEventType } from 'communication';
import { NotificationService } from 'notification';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { AccountRepository, ConnectionsRepository, IAccount, IConnection } from 'trading';
import { AccountNode, AccountNodeSubscriber, IAccountNodeData } from './account.node';
import { HttpErrorInterceptor } from './interceptor';

@Injectable()
export class AccountsManager {
  private _connectionsData = this._getAccountNodeData();
  private __connections: IConnection[] = [];

  private get _connections(): IConnection[] {
    return this.__connections;
  }

  private set _connections(value: IConnection[]) {
    this._connectionsData = this._getAccountNodeData(this._connections, value);
    this.__connections = value;
    this._connectedConnections = value.filter(i => i.connected);
  }

  private _connectedConnectionsData = this._getAccountNodeData();
  private __connectedConnections: IConnection[] = [];

  private get _connectedConnections(): IConnection[] {
    return this.__connectedConnections;
  }

  private set _connectedConnections(value: IConnection[]) {
    this._connectedConnectionsData = this._getAccountNodeData(this._connectedConnections, value);
    this.__connectedConnections = value;
  }

  private _accountsData = this._getAccountNodeData<IAccount>();
  private __accounts: IAccount[] = [];

  private get _accounts(): IAccount[] {
    return this.__accounts;
  }

  private set _accounts(value: IAccount[]) {
    this._accountsData = this._getAccountNodeData<IAccount>(this._accounts, value);
    this.__accounts = value;
  }

  private _subscribers = new Map<AccountNode, Set<AccountNodeSubscriber>>();

  private _wsIsOpened = false;
  private _wsHasError = false;

  constructor(
    protected _injector: Injector,
    private _connectionsRepository: ConnectionsRepository,
    private _accountRepository: AccountRepository,
    private _webSocketService: WebSocketService,
    private _interceptor: HttpErrorInterceptor,
    private _notificationService: NotificationService,
  ) {
  }

  async init(): Promise<IConnection[]> {
    // this._interceptor.disconnectError.subscribe(() => this._deactivateConnection());

    await this._fetchConnections();
    await this._emitData();

    this._connectedConnections.forEach(connection => this._wsInit(connection));

    return this._connections;
  }

  subscribe(node: AccountNode, ...subscribers: AccountNodeSubscriber[]) {
    subscribers.push(node);

    if (!this._subscribers.has(node)) {
      this._subscribers.set(node, new Set());
    }

    const _subscribers = this._subscribers.get(node);

    subscribers.forEach(subscriber => {
      if (_subscribers.has(subscriber)) {
        return;
      }

      _subscribers.add(subscriber);

      if (node.connection) {
        this._emitConnectionToSubscriber(subscriber, node.connection, node.account);
      }

      this._emitDataToSubscriber(subscriber);
    });
  }

  changeNodeAccount(node: AccountNode, account: IAccount) {
    const connection = account
      ? this._connectedConnections.find(i => i.id === account.connectionId)
      : undefined;

    this._emitConnectionToNode(node, connection, account);
  }

  private async _fetchConnections(): Promise<void> {
    return this._connectionsRepository.getItems().toPromise().then(res => {
      this._connections = res.data.map(item => {
        if (item.connected && !item.connectOnStartUp) {
          item.connected = false;
          delete item.connectionData;
        }
        return item;
      });
    });
  }

  private async _getAccountsByConnections(connections: IConnection[]): Promise<IAccount[]> {
    if (!connections.length) {
      return [];
    }

    const params = {
      status: 'Active',
      criteria: '',
    };

    // const observables = connections.map(connection => {
    //   return this._accountRepository.get(connection).getItems(params);
    // });

    // return forkJoin(observables).toPromise().then((responses: IPaginationResponse<IAccount>[]) => {
    //   return responses.reduce((accum, res) => {
    //     res.data.forEach(item => {
    //       if (!accum.some(i => i.id === item.id)) {
    //         accum.push(item);
    //       }
    //     });

    //     return accum;
    //   }, []);
    // });

    return this._accountRepository.getItems(params).toPromise().then(i => i.data);
  }

  private _wsInit(connection: IConnection) {
    const webSocketService = this._webSocketService.get(connection);

    webSocketService.on(WSEventType.Message, this._wsHandleMessage.bind(this));
    webSocketService.on(WSEventType.Open, this._wsHandleOpen.bind(this));
    webSocketService.on(WSEventType.Error, this._wsHandleError.bind(this));

    webSocketService.connect();

    webSocketService.send({ type: 'Id', value: connection.connectionData.apiKey });
  }

  private _wsClose(connection: IConnection) {
    this._webSocketService.destroy(connection);
  }

  private _wsHandleMessage(msg: any, connection: IConnection): void {
    if (msg.type === 'Connect' && (
      msg.result.type === AlertType.ConnectionClosed ||
      msg.result.type === AlertType.ConnectionBroken ||
      msg.result.type === AlertType.ForcedLogout
    ) || msg.type === 'Error' && msg.result.value === 'No connection!') {
      this._deactivateConnection(connection);
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

    this._notificationService.showError('Connection lost.');

    if (connection?.connected) {
      this.onUpdated({
        ...connection,
        error: true,
      });
    }
  }

  private _deactivateConnection(connection: IConnection): void {
    if (!connection) {
      return;
    }

    const _connection = { ...connection, connected: false };

    this._connectionsRepository.updateItem(_connection)
      .pipe(tap(() => this.onUpdated(_connection)))
      .subscribe();
  }

  createConnection(connection: IConnection): Observable<IConnection> {
    return this._connectionsRepository.createItem(connection)
      .pipe(tap((conn) => this.onCreated(conn)));
  }

  rename(name: string, connection: IConnection): Observable<IConnection> {
    const _connection = { ...connection, name };

    return this._connectionsRepository.updateItem(_connection)
      .pipe(tap(() => this.onUpdated(_connection, false)));
  }

  connect(connection: IConnection): Observable<IConnection> {
    return this._connectionsRepository.connect(connection)
      .pipe(
        concatMap(item => {
          return this._connectionsRepository.updateItem(item)
            .pipe(map(_ => item));
        }),
        tap((conn) => {
          if (!conn.error) {
            this._wsInit(conn);
          }

          this.onUpdated(conn, !conn.error);
        }),
      );
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
    const _connection = { ...connection, favourite: !connection.favourite };

    return this._connectionsRepository.updateItem(_connection)
      .pipe(
        tap(() => this.onUpdated(_connection, false)),
      );
  }

  protected onCreated(connection: IConnection): void {
    if (!connection.name) {
      connection.name = `${connection.server}(${connection.gateway})`;
    }

    this._connections = this._connections.concat(connection);

    this._emitData();
    this._emitConnection(connection);
  }

  protected onDeleted(connection: IConnection): void {
    this._connections = this._connections.filter(i => i.id !== connection.id);

    this._emitData();
    this._emitConnection(connection);
  }

  protected onUpdated(connection: IConnection, emitConnection = true): void {
    this._connections = this._connections.map(i => i.id === connection.id ? connection : i);

    this._emitData();

    if (emitConnection) {
      this._emitConnection(connection);
    }
  }

  private async _emitData(): Promise<void> {
    const accounts = this._accounts.filter(account => {
      return this._connectedConnections.some(i => i.id === account.connectionId);
    });

    const _accounts = await this._getAccountsByConnections(this._connectedConnectionsData.created);

    this._accounts = accounts.concat(_accounts);

    this._forEachSubscriber(subscriber => {
      this._emitDataToSubscriber(subscriber);
    });
  }

  private _emitDataToSubscriber(subscriber: AccountNodeSubscriber) {
    subscriber.handleConnectionsChange(this._connectionsData);
    subscriber.handleConnectedConnectionsChange(this._connectedConnectionsData);
    subscriber.handleAccountsChange(this._accountsData);
  }

  private _emitConnection(connection: IConnection, account?: IAccount) {
    const nodes = this._subscribers.keys();

    for (let node of nodes) {
      if (connection.id === node.connection?.id && connection.connected !== node.connection?.connected) {
        const _connection = this._connections.find(i => i.id === connection.id);

        this._emitConnectionToNode(node, _connection, account);
      }
    }

    if (!connection.connected) {
      this._wsClose(connection);
    }
  }

  private _emitConnectionToNode(node: AccountNode, connection: IConnection, account?: IAccount) {
    this._setConnectionToSubscriber(node, connection, account);

    this._subscribers.get(node).forEach(subscriber => {
      this._emitConnectionToSubscriber(subscriber, connection, account);
    });
  }

  private _emitConnectionToSubscriber(subscriber: AccountNodeSubscriber, connection: IConnection, account?: IAccount) {
    this._setConnectionToSubscriber(subscriber, connection, account);

    subscriber.handleConnection(connection);

    if (connection?.connected) {
      subscriber.handleConnect(connection);
    } else {
      subscriber.handleDisconnect(connection);
    }

    subscriber.handleAccountChange(account);
  }

  private _setConnectionToSubscriber(subscriber: AccountNodeSubscriber, connection: IConnection, account?: IAccount) {
    if (connection?.connected) {
      subscriber.connection = connection;

      if (account) {
        subscriber.account = account;
      }
    } else {
      subscriber.connection = undefined;
      subscriber.account = undefined;
    }
  }

  private _getAccountNodeData<T extends IBaseItem = IConnection>(prev: T[] = [], current: T[] = []): IAccountNodeData<T> {
    const deleted = prev.filter(i => !current.some(_i => _i.id === i.id));
    const created = current.filter(i => !prev.some(_i => _i.id === i.id));

    return {
      current,
      prev,
      created,
      deleted,
    };
  }

  private _forEachSubscriber(callback: (subscriber: AccountNodeSubscriber, node: AccountNode) => void) {
    this._subscribers.forEach((subscribers, node) => {
      subscribers.forEach(subscriber => callback(subscriber, node));
    });
  }
}
