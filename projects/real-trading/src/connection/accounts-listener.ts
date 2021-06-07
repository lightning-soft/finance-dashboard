import { Injectable } from '@angular/core';
import { Id } from 'communication';
// import { MixinHelper } from '../../../base-components/src/helpers/mixin.helper';
// import { MixinHelper } from 'base-components';
import { IAccount, IInstrument } from 'trading';
// const { mixinDecorator } = MixinHelper;

function mixinDecorator(
    constructor: any,
    extendableMethods: string[] = [],
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
                    extendableMethods.includes(name)
                    && typeof derivedCtorProp === 'function'
                    && typeof constructorProp === 'function'
                ) {
                    derivedCtor.prototype[name] = function (...args: any[]) {
                        if (derivedCtorProp) {
                            derivedCtorProp.apply(this, args);
                        }

                        if (constructorProp) {
                            constructorProp.apply(this, args);
                        }
                    }
                } else {
                    derivedCtor.prototype[name] = constructorProp;
                }
            });
    };
}


class AccountsListenerRegister {
    _listeners = [];

    subscribe(listener: AccountsListener) {
        this._listeners.push(listener);
    }

    unsubscribe(listener: AccountsListener) {
        this._listeners = this._listeners.filter(i => i != listener);
    }

    notifyAccountsConnected(accounts: IAccount[], connectedAccounts: IAccount[]) {
        for (const listener of this._listeners) {
            if (listener.handleAccountsConnect)
                listener.handleAccountsConnect(accounts, connectedAccounts);
        }
    }

    notifyAccountsDisconnected(accounts: IAccount[], connectedAccounts: IAccount[]) {
        for (const listener of this._listeners) {
            if (listener.handleAccountsDisconnect)
                listener.handleAccountsDisconnect(accounts, connectedAccounts);
        }
    }
}

export const accountsListeners = new AccountsListenerRegister();

interface AccountsListener {
    handleAccountsConnect(acccounts: IAccount[], connectedAccounts: IAccount[]);
    handleAccountsDisconnect(acccounts: IAccount[], connectedAccounts: IAccount[]);
}

interface _AccountsListener extends AccountsListener { }


@Injectable() // just to avoid error in console
abstract class _AccountsListener {
    ngOnInit() {
        accountsListeners.subscribe(this);
    }

    ngOnDestroy() {
        accountsListeners.unsubscribe(this);
    }
}

export function AccountsListener() {
    return mixinDecorator(_AccountsListener);
}

export function filterByAccountConnection<T>(accountContainer: { account: IAccount }, fn: (data: T, connectionId: Id) => any) {
    return (data: T, connectionId: Id) => {
        if (accountContainer.account.connectionId === connectionId) {
            fn(data, connectionId);
        }
    }
}

export function filterByConnectionAndInstrument<T extends { instrument: { id: Id } }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
    return (data: T, connectionId: Id) => {
        if (container?.account?.connectionId === connectionId && data?.instrument?.id === container?.instrument?.id) {
            fn(data, connectionId);
        }
    }
}

export function filterByAccountAndInstrument<T extends { instrument: { id: Id }, accountId: Id }>(container: { account: IAccount, instrument: IInstrument }, fn: (data: T, connectionId: Id) => any) {
    return (data: T, connectionId: Id) => {
        if (container?.account?.id === data.accountId && data?.instrument?.id === container?.instrument?.id) {
            fn(data, connectionId);
        }
    }
}