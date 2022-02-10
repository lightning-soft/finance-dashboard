import { Injectable } from '@angular/core';
import { Id } from 'communication';
import { IAccount, IConnection, IInstrument } from 'trading';

function mixinDecorator(
  constructor: any,
): (constructor: any) => void {
  return (derivedCtor: any) => {
    Object.getOwnPropertyNames(constructor.prototype)
      .forEach(name => {
        if (name === 'constructor') {
          return;
        }

        const derivedCtorProp = derivedCtor.prototype[name];
        const constructorProp = constructor.prototype[name];

        if (
          typeof derivedCtorProp === 'function'
          && typeof constructorProp === 'function'
        ) {
          derivedCtor.prototype[name] = function (...args: any[]) {
            if (derivedCtorProp) {
              derivedCtorProp.apply(this, args);
            }

            if (constructorProp) {
              constructorProp.apply(this, args);
            }
          };
        } else {
          derivedCtor.prototype[name] = constructorProp;
        }
      });
  };
}


class AccountsListenerRegister {
  private _listeners = [];
  private _accounts = [];
  private _connnections = [];

  subscribe(listener: IAccountsListener) {
    this._listeners.push(listener);
    if ((listener as any).handleConnectionsConnect)
      (listener as any).handleConnectionsConnect(this._connnections, this._connnections.filter(item => item.connected));
    if (listener.handleAccountsConnect)
      listener.handleAccountsConnect(this._accounts, this._accounts);
  }

  unsubscribe(listener: IAccountsListener) {
    this._listeners = this._listeners.filter(i => i != listener);
  }

  notifyAccountsConnected(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this._accounts = connectedAccounts;
    for (const listener of this._listeners) {
      if (listener.handleAccountsConnect)
        listener.handleAccountsConnect(accounts, connectedAccounts);
    }
  }

  notifyDefaultChanged(connections: IConnection[], conn: IConnection) {
    this._connnections = connections;
    for (const listener of this._listeners) {
      if (listener.handleDefaultConnectionChanged)
        listener.handleDefaultConnectionChanged(connections, conn);
    }
  }

  notifyAccountsDisconnected(accounts: IAccount[], connectedAccounts: IAccount[]) {
    this._accounts = connectedAccounts;
    for (const listener of this._listeners) {
      if (listener.handleAccountsDisconnect)
        listener.handleAccountsDisconnect(accounts, connectedAccounts);
    }
  }

  notifyConnectionsConnected(connections: IConnection[], connectedConnections: IConnection[]) {
    this._connnections = connectedConnections;
    for (const listener of this._listeners) {
      if (listener.handleConnectionsConnect)
        listener.handleConnectionsConnect(connections, connectedConnections);
    }
  }

  notifyConnectionsDisconnected(connections: IConnection[], connectedConnections: IConnection[]) {
    this._connnections = connectedConnections;
    for (const listener of this._listeners) {
      if (listener.handleConnectionsDisconnect)
        listener.handleConnectionsDisconnect(connections, connectedConnections);
    }
  }
}

export let accountsListeners: AccountsListenerRegister;
if (!window?.opener) {
  accountsListeners = new AccountsListenerRegister();
  (window as any).accountsListeners = accountsListeners;
  window.deps.set('accountsListeners', accountsListeners);
}
else {
  accountsListeners = (window as any).deps?.get('accountsListeners');
}

export interface IAccountsListener {
  handleAccountsConnect(accounts: IAccount[], connectedAccounts: IAccount[]);

  handleAccountsDisconnect(accounts: IAccount[], connectedAccounts: IAccount[]);
}

export interface IConnectionsListener {
  handleConnectionsConnect(connections: IConnection[], connectedConnections: IConnection[]);
  handleDefaultConnectionChanged(connections: IConnection[], defaultConnection: IConnection);
  handleConnectionsDisconnect(connections: IConnection[], connectedConnections: IConnection[]);
}

interface _AccountsListener extends IAccountsListener {
}


@Injectable() // just to avoid error in console
abstract class _AccountsListener {

  ngOnInit() {
    accountsListeners.subscribe(this);
  }

  ngOnDestroy() {
    accountsListeners.unsubscribe(this);
  }
}

export interface IAccountListener {
  accounts: IAccount[];
  account: IAccount;
}

@Injectable() // just to avoid error in console
abstract class _AccountListener extends _AccountsListener implements IConnectionsListener {
  accounts: IAccount[] = [];
  account: IAccount;
  accountId: Id;
  selectDefault = true;
  defaultConnection: IConnection;


  ngOnInit() {
    accountsListeners.subscribe(this);
  }

  ngOnDestroy() {
    accountsListeners.unsubscribe(this);
  }

  handleConnectionsConnect(connections: IConnection[], connectedConnections: IConnection[]) {
    this.defaultConnection = connectedConnections.find(item => item.isDefault);
  }

  handleDefaultConnectionChanged(connections: IConnection[], defaultConnection: IConnection) {
    this.defaultConnection = defaultConnection;
  }
  handleConnectionsDisconnect(connections: IConnection[], connectedConnections: IConnection[]) {
    this.defaultConnection = connectedConnections.find(item => item.isDefault);
  }

  handleAccountsConnect(accounts: IAccount[], allAccounts: IAccount[]) {
    this.accounts = allAccounts;
    const selectFirstAsDefault = this.selectDefault ?? true;
    if (this.account == null && accounts.length && selectFirstAsDefault) {
      this.account = allAccounts.find(item => item.connectionId === this.defaultConnection?.id) || allAccounts[0];
    }
    this.onAccountChanged();
  }

  handleAccountsDisconnect(disconnectedAccounts: IAccount[], allAccounts: IAccount[]) {
    this.accounts = allAccounts;

    if (disconnectedAccounts.some(account => this.account?.id === account.id) && this.selectDefault && allAccounts.length) {
      this.account = allAccounts.find(item => item.connectionId === this.defaultConnection?.id) || allAccounts[0];
    }
    this.onAccountChanged();
  }

  onAccountChanged() {
  }
}

export function AccountsListener() {
  return mixinDecorator(_AccountsListener);
}

export function ConnectionsListener() {
  return mixinDecorator(_AccountsListener);
}

export function AccountListener() {
  return mixinDecorator(_AccountListener);
}

export function filterByAccountsConnection<T>(accountContainer: { accounts: IAccount[] }, fn: (data: T, connectionId) => any) {
  return (data: T, connectionId: Id) => {
    if (accountContainer.accounts.some(item => item.connectionId === connectionId)) {
      fn(data, connectionId);
    }
  };
}

export function filterByAccountConnection<T>(accountContainer: { account: IAccount }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (accountContainer.account?.connectionId === connectionId) {
      fn(data, connectionId);
    }
  };
}

export function filterConnection<T>(accountContainer: { connection: { id: Id } }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (accountContainer.connection?.id === connectionId) {
      fn(data, connectionId);
    }
  };
}

export function filterByConnectionAndInstrument<T extends { instrument: { id: Id } }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (container?.account?.connectionId === connectionId && data?.instrument?.id === container?.instrument?.id) {
      fn(data, connectionId);
    }
  };
}

export function filterByAccountIdAndInstrument<T extends { instrument: { id: Id }, accountId: Id }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (container?.account?.id === data.accountId && data?.instrument?.id === container?.instrument?.id) {
      fn(data, connectionId);
    }
  };
}

export function filterPositions<T extends { instrument: { id: Id }, account?: IAccount }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (container?.account?.id === data.account.id && data?.instrument?.id === container?.instrument?.id) {
      fn(data, connectionId);
    }
  };
}

export function filterByAccountAndInstrument<T extends { instrument: { id: Id }, account: { id: Id } }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (container?.account?.id === data?.account?.id && data?.instrument?.id === container?.instrument?.id) {
      fn(data, connectionId);
    }
  };
}

export function filterByAccount<T extends { instrument: { id: Id }, accountId: Id }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
  return (data: T, connectionId: Id) => {
    if (container?.account?.id === data.accountId) {
      fn(data, connectionId);
    }
  };
}
