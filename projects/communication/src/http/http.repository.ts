import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { Id } from 'communication';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ExcludeId, IBaseItem, IPaginationResponse, Repository, RepositoryAction } from '../common';
import { CommunicationConfig } from './communication.config';
import { ObservableCacheService } from 'cache';

@Injectable()
export abstract class HttpRepository<T extends IBaseItem> extends Repository<T> {
  protected _cacheEnabled = false;
  protected _cache = new ObservableCacheService();

  protected get _baseUrl(): string {
    throw new Error(`Implement baseUrl for ${this}`);
  }

  protected get _httpOptions() {
    return {};
  }

  onInit() {
  }

  constructor(
    @Inject(HttpClient) protected _http: HttpClient,
    @Optional() @Inject(CommunicationConfig) protected _communicationConfig: CommunicationConfig,
    @Optional() @Inject(Injector) protected _injector: Injector,
  ) {
    super();

    this.onInit();
  }

  getItemById(id: number | string, query?: any): Observable<T> {
    const { headers, ...params } = this._mapItemParams(query, RepositoryAction.Read);

    const request = this._http.get<T>(this._getRESTURL(id), { ...this._httpOptions, headers, params })
      .pipe(
        map(res => this._mapItemResponse(res, query, RepositoryAction.Read)),
      );

    const cacheKey = `${id}${JSON.stringify(query)}`;

    if (this._cacheEnabled) {
      return this._cache.get(cacheKey, request);
    }

    return request;
  }

  getItems(obj?: any): Observable<IPaginationResponse<T>> {
    let params = {};

    const { id = null, headers, ...query } = this._mapItemsParams(obj ?? {});

    if (query) {
      if (query.skip != null) {
        query.offset = query.skip;
        // delete query.skip;
      }

      if (query.take != null) {
        query.limit = query.take;
        // delete query.take;
      }

      params = new HttpParams({ fromObject: query });
    }

    if (headers && !headers['Api-Key'])
      console.warn('NO API KEY', this.constructor.name, JSON.stringify(headers));

    const request = this._http.get<IPaginationResponse<T>>(this._getRESTURL(id), { ...this._httpOptions, headers, params })
      .pipe(
        map(res => this._mapItemsResponse(res, obj)),
      );

    const cacheKey = JSON.stringify(query);

    if (this._cacheEnabled) {
      return this._cache.get(cacheKey, request);
    }

    return request;
  }

  createItem(item: ExcludeId<T>, options?: any): Observable<any> {
    const action = RepositoryAction.Create;
    const itemParams = this._mapItemParams(options, action);
    const { headers, ...params } = itemParams || {};

    return this._createItem(this._mapRequestItem(item, action), { headers, params })
      .pipe(
        map(res => this._mapItemResponse(res, params, action)),
        tap(i => this._onCreate(i)),
      );
  }

  protected _createItem(item: ExcludeId<T>, options?: any): Observable<any> {
    return this._http.post(this._getRESTURL(), item, { ...this._httpOptions, ...options });
  }

  updateItem(item: T, query?: any): Observable<T> {
    const action = RepositoryAction.Update;
    const { id, ...dto } = this._mapRequestItem(item, action);
    const params = this._mapItemParams(query, action);

    return this._http.put<T>(this._getRESTURL(id), dto, { ...this._httpOptions, ...params })
      .pipe(
        map(res => this._mapItemResponse(res, params, action)),
        tap(i => {
          this._onUpdate(i);
        }),
      );
  }

  deleteItem(id: number | string): Observable<any> {
    return this._http.delete(this._getRESTURL(id), this._httpOptions)
      .pipe(
        tap(() => this._onDelete({ id })),
      );
  }

  getItemsByIds(ids?: Id[]): Observable<T[]> {
    if (!ids || !ids.length) {
      return of([]);
    }

    // return this.getItems({ s: JSON.stringify({ id: { $in: ids } }) }).pipe(map(i => i as any));
    return forkJoin(ids.map(id => this.getItemById(id)));
  }

  protected _concatUrl(...params: (string | number)[]): string {
    return `${this._baseUrl}`.concat('/', params.filter(Boolean).map(toString).join('/'));
  }

  protected _getRESTURL(id?) {
    return this._concatUrl(id ? encodeURI(id) : '');
  }

  protected arrayToUrl(...params: (string | number)[]) {
    return params.filter(Boolean).map(toString).join('/');
  }
}

function toString(i) {
  return i.toString();
}

