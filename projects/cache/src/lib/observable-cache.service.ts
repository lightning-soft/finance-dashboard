import { isObservable, Observable, of } from 'rxjs';
import { catchError, finalize, shareReplay, take } from 'rxjs/operators';
import { CustomCache } from './custom-cache';
import { Injectable } from "@angular/core";

@Injectable()
export class ObservableCacheService<T = any> extends CustomCache<Observable<T>> {
  public cache = new Map<any, Observable<T>>();

  get(key: string, setValue?: Observable<T>): Observable<T> {
    // if (this.cache.has(key)) {
    //   return this.cache.get(key).pipe(
    //     take(1),
    //   );
    // }

    // if (setValue) {
    //   return this.set(key, setValue);
    // }

    // return of(null);
    return setValue;
  }

  set(key: string, data: T | Observable<T>): Observable<T> {
    data = isObservable(data) ? data : of(data);

    return this.cache.set(key, data.pipe(
      catchError((err) => {
        console.error('[OBSERVABLE CACHE SET] VALUE ERR', err);
        return of(err);
      }),
      finalize(() => {
        if (this.configHasProperty('clearTimeout')) {
          this._timeout = setTimeout(() => this.delete(key), this.config.clearTimeout);
        }
      }),
      shareReplay(1),
    )).get(key).pipe(
      take(1),
    );
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): Observable<T> {
    const deleteItem = this.cache.get(key);

    this.cache.delete(key);

    return deleteItem;
  }
}
