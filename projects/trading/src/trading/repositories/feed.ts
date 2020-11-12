import { Injectable } from '@angular/core';

export type OnTradeFn<T> = (item: T) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export abstract class Feed<T> {
  abstract on(fn: OnTradeFn<T>): UnsubscribeFn;
}

