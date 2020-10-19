import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Id } from 'communication';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ExcludeId, IBaseItem, IPaginationResponse, Repository } from '../common';
import { CommunicationConfig } from './communication.config';

@Injectable()
export abstract class HttpRepository<T extends IBaseItem> extends Repository<T> {
  protected _baseUrl: string;

  constructor(
    @Inject(HttpClient) protected _http: HttpClient,
    @Optional() @Inject(CommunicationConfig) protected _communicationConfig: CommunicationConfig) {
    super();
    console.log('new', this.constructor.name);
    try {
      this._baseUrl = this._getURL(_communicationConfig) || 'Invalid proxy configuration';
    } catch (e) {
      console.error('Invalid base url configuration', e);
    }
  }

  protected abstract _getURL(config: CommunicationConfig): string;

  getItemById(id: number | string, query?: any): Observable<T> {
    return this._http.get<T>(this._getRESTURL(id), { params: query });
  }

  getItems(obj?: any): Observable<IPaginationResponse<T>> {
    let params = {};
    const query = { ...obj };

    if (query) {
      if (query.skip != null) {
        query.offset = query.skip;
        delete query.skip;
      }

      if (query.take != null) {
        query.limit = query.take;
        delete query.take;
      }

      params = new HttpParams({ fromObject: query });
    }

    return this._http.get<IPaginationResponse<T>>(this._getRESTURL(), { params });
  }

  createItem(item: ExcludeId<T>, options?: any): Observable<any> {
    return this._http.post(this._getRESTURL(), item, options)
      .pipe(tap(i => this._onCreate(i)));
  }

  updateItem(item: T, query?: any): Observable<T> {
    const { id, ...dto } = item;
    return this._http.patch<T>(this._getRESTURL(id), dto, { params: query })
      .pipe(tap(this._onUpdate));
  }

  deleteItem(id: number | string): Observable<any> {
    return this._http.delete(this._getRESTURL(id))
      .pipe(tap(() => this._onDelete({ id })));
  }

  getItemsByIds(ids?: Id[]): Observable<T[]> {
    if (!ids || !ids.length) {
      return of([]);
    }

    return this.getItems({ s: JSON.stringify({ id: { $in: ids } }) }).pipe(map(i => i as any));
    // return forkJoin(ids.map(id => this.getItemById(id)));
  }

  protected _concatUrl(...params: (string | number)[]): string {
    return `${this._baseUrl}`.concat('/', params.filter(Boolean).map(toString).join('/'));
  }

  protected _getRESTURL(id?) {
    return this._concatUrl(id);
  }

  protected arrayToUrl(...params: (string | number)[]) {
    return params.filter(Boolean).map(toString).join('/');
  }
}

function toString(i) {
  return i.toString();
}
