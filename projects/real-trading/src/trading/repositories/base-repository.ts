import { HttpRepository, IBaseItem } from 'communication';

export abstract class BaseRepository<T extends IBaseItem> extends HttpRepository<T> {
  protected _needRefreshCache = false;

  protected abstract get suffix();

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + this.suffix;
  }

  protected get _apiKey(): string {
    return this.connection?.connectionData?.apiKey;
  }

  protected get _httpOptions() {
    return {
      headers: {
        'Api-Key': this._apiKey ?? '',
      },
    };
  }
}
