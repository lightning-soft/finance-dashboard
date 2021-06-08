import { Injectable } from '@angular/core';
import { Id } from 'communication';

// TODO: remove optional
export type OnTradeFn<T> = (item: T, connectionId: Id) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export abstract class Feed<T> {
  abstract on(fn: OnTradeFn<T>): UnsubscribeFn;
}

