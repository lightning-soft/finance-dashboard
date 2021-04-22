import { fromEvent, Observable, of, merge } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class NetworkService {

  isOnline: boolean;
  isOnline$: Observable<boolean>;

  constructor() {
    this.isOnline$ = merge(of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      tap(value => this.isOnline = value)
    );
  }
}
