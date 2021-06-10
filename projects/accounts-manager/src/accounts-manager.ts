import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AlertType, ConenctionWebSocketService, Id, WSEventType } from 'communication';
import { NotificationService } from 'notification';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, mergeMap, tap } from 'rxjs/operators';
import { AccountRepository, ConnectionContainer, ConnectionsRepository, IAccount, IConnection } from 'trading';
// Todo: Make normal import
// The problem now - circular dependency
import { accountsListeners } from '../../real-trading/src/connection/accounts-listener';

@Injectable()
export class AccountsManager implements ConnectionContainer {

  // private __connections: IConnection[] = [];

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

  getApiKeyByAccountId(accountId: Id): string {
    if (!accountId)
      return null;

    return this._accountsConnection.get(accountId)?.id;
  }

  async init(): Promise<IConnection[]> {
    await this._fetchConnections();
    for (const conn of this._connections.filter(i => i.connectOnStartUp))
      this.connect(conn).subscribe(); // TODO: handleError

    return this._connections;
  }

  private _fetchAccounts(connection: IConnection) {
    this._getAccountsByConnections(connection).then(accounts => {
      this._accounts = this._accounts.concat(accounts);
      accountsListeners.notifyAccountsConnected(accounts, this._accounts);
      for (const account of accounts) {
        this._accountsConnection.set(account.id, connection);
      }
    });
  }

  // subscribe(node: AccountNode, ...subscribers: AccountNodeSubscriber[]) {
  //   subscribers.push(node);

  //   if (!this._subscribers.has(node)) {
  //     this._subscribers.set(node, new Set());
  //   }

  //   const _subscribers = this._subscribers.get(node);

  //   subscribers.forEach(subscriber => {
  //     if (_subscribers.has(subscriber)) {
  //       return;
  //     }

  //     _subscribers.add(subscriber);

  //     if (node.connection) {
  //       this._emitConnectionToSubscriber(subscriber, node.connection, node.account);
  //     }

  //     this._emitDataToSubscriber(subscriber);
  //   });
  // }

  // changeNodeAccount(node: AccountNode, account: IAccount) {
  //   const connection = account
  //     ? this._connectedConnections.find(i => i.id === account.connectionId)
  //     : undefined;

  //   this._emitConnectionToNode(node, connection, account);
  // }

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

  private async _getAccountsByConnections(connection: IConnection): Promise<IAccount[]> {
    if (!connection) {
      return [];
    }

    const params = {
      status: 'Active',
      criteria: '',
      connection,
    };

    return this._accountRepository.getItems(params)
      .pipe(catchError(e => of({ data: [] } as any)))
      .toPromise().then((i) => i.data);
  }

  private _initWS(connection: IConnection) {
    const webSocketService = this._webSocketService.get(connection);

    webSocketService.on(WSEventType.Message, this._wsHandleMessage.bind(this));
    webSocketService.on(WSEventType.Open, this._wsHandleOpen.bind(this));
    webSocketService.on(WSEventType.Error, this._wsHandleError.bind(this));

    webSocketService.connect();

    webSocketService.send({ type: 'Id', value: connection.connectionData.apiKey }, connection.id);
  }

  private _closeWS(connection: IConnection) {
    const webSocketService = this._webSocketService.get(connection);

    webSocketService.destroy(connection);
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
      .pipe(tap(() => this.onUpdated(_connection)));
  }

  connect(connection: IConnection): Observable<IConnection> {
    return this._connectionsRepository.connect(connection)
      .pipe(
        concatMap(item => {
          return this._connectionsRepository.updateItem(item)
            .pipe(map(_ => item));
        }),
        tap((conn) => {
          if (conn.connected) {
            this._initWS(conn);
            this._fetchAccounts(conn);
          }

          this.onUpdated(conn);
        }),
      );
  }

  private _onDisconnected(connection: IConnection) {
    const disconectedAccounts = this._accounts.filter(account => account.connectionId === connection.id);
    this._accounts = this._accounts.filter(account => account.connectionId !== connection.id);
    for (const account of disconectedAccounts) {
      this._accountsConnection.delete(account.id);
    }
    accountsListeners.notifyAccountsDisconnected(disconectedAccounts, this._accounts);
    this._closeWS(connection);
  }

  disconnect(connection: IConnection): Observable<void> {
    return this._connectionsRepository.disconnect(connection)
      .pipe(
        map(() => ({ ...connection, connected: false })),
        tap((updatedConnection) => this.onUpdated(updatedConnection)),
        tap((connection) => this._onDisconnected(connection)),
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

  // private _emitDataToSubscriber(subscriber: AccountNodeSubscriber) {
  //   subscriber.handleConnectionsChange(this._connectionsData);
  //   subscriber.handleConnectedConnectionsChange(this._connectedConnectionsData);
  //   subscriber.handleAccountsChange(this._accountsData);
  // }

  //   if (!connection.connected) {
  //     this._wsClose(connection);
  //   }
  // }

  // private _emitConnectionToNode(node: AccountNode, connection: IConnection, account?: IAccount) {
  //   this._setConnectionToSubscriber(node, connection, account);

  //   this._subscribers.get(node).forEach(subscriber => {
  //     this._emitConnectionToSubscriber(subscriber, connection, account);
  //   });
  // }

  // private _emitConnectionToSubscriber(subscriber: AccountNodeSubscriber, connection: IConnection, account?: IAccount) {
  //   this._setConnectionToSubscriber(subscriber, connection, account);

  //   subscriber.handleConnection(connection);

  //   if (connection?.connected) {
  //     subscriber.handleConnect(connection);
  //   } else {
  //     subscriber.handleDisconnect(connection);
  //   }

  //   subscriber.handleAccountChange(account);
  // }

  // private _setConnectionToSubscriber(subscriber: AccountNodeSubscriber, connection: IConnection, account?: IAccount) {
  //   if (connection?.connected) {
  //     subscriber.connection = connection;

  //     if (account) {
  //       subscriber.account = account;
  //     }
  //   } else {
  //     subscriber.connection = undefined;
  //     subscriber.account = undefined;
  //   }
  // }

}
