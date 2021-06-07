import { Injectable } from '@angular/core';
import { Id } from 'communication';
import { ConnectionsFactory } from '../../../../real-trading/src/trading/repositories/connections.factory';

// TODO: remove optional
export type OnTradeFn<T> = (item: T, connectionId?: Id) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export abstract class Feed<T> extends ConnectionsFactory {
  abstract on(fn: OnTradeFn<T>): UnsubscribeFn;
}

