import { HttpRepository, IBaseItem, Id, IPaginationResponse } from 'communication';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionContainer, IConnection } from 'trading';
import * as _ from 'underscore';

const ApiKey = 'Api-Key';

export abstract class BaseRepository<T extends IBaseItem> extends HttpRepository<T> {
  protected _needRefreshCache = false;

  protected abstract get suffix();

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + this.suffix;
  }

  // protected get _httpOptions() {
  //   // throw new Error('Deprecaated');
  //   // return {
  //   //   headers: {
  //   //     'Api-Key': this._apiKey ?? '',
  //   //   },
  //   // };
  // }

  protected _connectionContainer: ConnectionContainer;

  onInit() {
    this._connectionContainer = this._injector.get(ConnectionContainer);
  }

  getItems(params?: any): Observable<IPaginationResponse<T>> {
    const accounts = params.accounts;
    delete params.accounts;

    if (Array.isArray(accounts)) {
      const configs = accounts.map(i => this._mapItemsParams({ ...params, accountId: i.id }));
      return forkJoin(configs.map(i => this.getItems(i)))
        .pipe(
          map(arr => {
            const data = _.flatten(arr.map(i => i.data));

            return {
              data,
              requestParams: {},
            } as any;
          })
        );
    }

    const itemParams = this._mapItemsParams(params);
    return super.getItems(itemParams)
      .pipe(map((res) => ({ ...res, data: res.data.map(item => ({ ...item, connectionId: itemParams.connectionId })) })));
  }

  // getItemById(id: string | number, query: any): Observable<T> {
  //   return super.getItemById(id, query);
  // }

  protected _mapItemsParams(params) {
    return this._mapItemParams(params);
  }

  protected _mapItemParams(params: any) {
    if (!params)
      params = {};

    const paramsHeaders = params?.headers ?? {};
    const optionsHeaders = (this._httpOptions as any)?.headers ?? {};
    const headers = { ...optionsHeaders, ...paramsHeaders };

    if (!params?.headers || !params?.headers[ApiKey]) {
      let connection = params.connectionId != null ? this.getConnection(params.connectionId) : params.connection;

      if (!connection)
        connection = this.getConnectionByAccount(params.accountId);
      if (connection) {
        params.connectionId = connection?.id;
        params.headers = this.getApiHeaders(this._getApiKey(connection));
      }
    }
    //  else {
    //   console.error(`Invalid ${ApiKey}, ${params?.headers && params?.headers[ApiKey]}`);
    // }

    this._processParams(params);

    return {
      headers,
      ...params,
    };
  }

  protected _processParams(obj: any) {
    // if ((obj as any)?.headers)
    //   delete (obj as any).headers;
    // if ((obj as any)?.accountId)
    //   delete (obj as any).accountId;
    if ((obj as any)?.connection)
      delete (obj as any).connection;
  }

  // getApiKeys(items: { accountId: Id }[]): Id[] {
  //   if (!Array.isArray(items))
  //     return;

  //   return items
  //     .map(i => this._connectionContainer.getApiKeyByAccountId(i.accountId))
  //     .filter((item, index, arr) => arr.indexOf(item) === index);
  // }

  private _getApiKey(connection: IConnection) {
    return connection?.connectionData?.apiKey;
  }

  getApiKey(item: { accountId?: Id, account?: { id } }): Id {
    if (!item)
      return null;

    return this._getApiKey(this._connectionContainer.getConnectionByAccountId(item.accountId ?? item.account?.id));
  }

  getConnection(connectionId: Id): IConnection {
    return this._connectionContainer.getConnection(connectionId);
  }

  getConnectionByAccount(accountId: Id): IConnection {
    return this._connectionContainer.getConnectionByAccountId(accountId);
  }

  getApiHeaders(apiKey: Id): any {
    return {
      'Api-Key': apiKey ?? '',
    };
  }

  getApiHeadersByAccount(accountId: Id): any {
    return {
      headers: this.getApiHeaders(this.getApiKey({ accountId }))
    };
  }
}
