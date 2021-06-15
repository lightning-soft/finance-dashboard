import { HttpRepository, IBaseItem, Id, IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionContainer, IConnection } from 'trading';

const ApiKey = 'Api-Key';

export abstract class BaseRepository<T extends IBaseItem> extends HttpRepository<T> {
  protected _needRefreshCache = false;

  protected abstract get suffix();

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + this.suffix;
  }

  protected get _apiKey(): string {
    throw new Error('Deprecaated');
    return this.connection?.connectionData?.apiKey;
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
    if (!params)
      params = {};

    const connection = params.connectionId != null ? this.getConnection(params.connectionId) : params.connection;

    if (!connection)
      params.headers = this.getApiHeadersByAccount(params.accountId).headers;
    else if (connection)
      params.headers = this.getApiHeaders(this._getApiKey(connection));

    if (!params?.headers[ApiKey]) {
      console.error(`Invalid ${ApiKey}, ${params?.headers[ApiKey]}`);
    }

    if (connection) {
      delete params.connection;
    }

    return super.getItems(params)
      .pipe(map((res) => ({ ...res, data: res.data.map(item => ({ ...item, connectionId: connection?.id })) })));
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
    return this._getApiKey(this._connectionContainer.getConnectionByAccountId(item.accountId ?? item.account.id));
  }

  getConnection(connectionId: Id): IConnection {
    return this._connectionContainer.getConnection(connectionId);
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
