import { HttpRepository, IBaseItem } from 'communication';
import { IConnection } from 'trading';

export abstract class BaseRepository<T extends IBaseItem> extends HttpRepository<T> {
  private _connection: IConnection;

  protected abstract get suffix();

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + this.suffix;
  }

  protected get _apiKey(): string {
    return this._connection?.connectionData?.apiKey;
  }

  protected get _httpOptions() {
    return {
      headers: {
        'Api-Key': this._apiKey ?? '',
      },
    };
  }

  forConnection(connection: IConnection) {
    if (this._connection && this._connection?.id === connection?.id)
      return this;

    const repository = this._getRepository();

    repository._connection = connection;

    return repository;
  }

  abstract _getRepository();
}
