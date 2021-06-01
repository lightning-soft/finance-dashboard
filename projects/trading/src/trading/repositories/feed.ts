import { Injectable } from '@angular/core';
import { ConnectionsFactory } from '../../../../real-trading/src/trading/repositories/connections.factory';

export type OnTradeFn<T> = (item: T) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export abstract class Feed<T> extends ConnectionsFactory {
  abstract on(fn: OnTradeFn<T>): UnsubscribeFn;
}

