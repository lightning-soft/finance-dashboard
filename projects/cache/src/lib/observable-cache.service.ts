import { isObservable, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, take } from 'rxjs/operators';
import { CustomCache } from './custom-cache';
import { Injectable } from "@angular/core";

@Injectable()
export class ObservableCacheService<T = any> extends CustomCache<Observable<T>> {
  public cache = new Map<any, Observable<T>>();

  get(key: string, setValue?: Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      this.set(key, setValue);
    }

    return this.cache.get(key).pipe(take(1));
  }

  set(key: string, data: T | Observable<T>): void {
    data = isObservable(data) ? data : of(data);

    this.cache.set(key, data.pipe(
      catchError((err) => {
        this.cache.delete(key);

        return throwError(err);
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
