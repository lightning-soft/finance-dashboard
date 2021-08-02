import { Injectable } from '@angular/core';
import { Id } from 'communication';

// TODO: remove optional
export type OnUpdateFn<T> = (item: T, connectionId?: Id) => void;
export type UnsubscribeFn = () => void;

@Injectable()
export abstract class Feed<T> {
  abstract on(fn: OnUpdateFn<T>): UnsubscribeFn;
}

