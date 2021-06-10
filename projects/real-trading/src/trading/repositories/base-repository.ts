import { HttpRepository, IBaseItem, Id } from 'communication';
import { ConnectionContainer } from 'trading';

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

  protected get _httpOptions() {
    throw new Error('Deprecaated');
    return {
      headers: {
        'Api-Key': this._apiKey ?? '',
      },
    };
  }

  protected _connectionContainer: ConnectionContainer;

  onInit() {
    this._connectionContainer = this._injector.get(ConnectionContainer);
  }

  // getApiKeys(items: { accountId: Id }[]): Id[] {
  //   if (!Array.isArray(items))
  //     return;

  //   return items
  //     .map(i => this._connectionContainer.getApiKeyByAccountId(i.accountId))
  //     .filter((item, index, arr) => arr.indexOf(item) === index);
  // }

  getApiKey(item: { accountId: Id }): Id {
    return this._connectionContainer.getApiKeyByAccountId(item.accountId);
  }

  getApiHeaders(apiKey: Id): any {
    return {
      headers: {
        'Api-Key': apiKey ?? '',
      }
    };
  }

  getApiHeadersByAccount(accountId: Id): any {
    return this.getApiHeaders(this.getApiKey({ accountId }));
  }
}
