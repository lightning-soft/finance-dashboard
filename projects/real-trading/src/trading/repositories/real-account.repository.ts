import { HttpRepository } from 'communication';
import { AccountRepository, IAccount } from 'trading';

export class RealAccountRepository extends HttpRepository<IAccount> implements AccountRepository {
  protected get suffix(): string {
    return 'Account';
  }

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + this.suffix;
  }

  protected _mapResponseItem(item: any): IAccount {
    return {
      ...item,
      connectionId: this.connection.id,
    };
  }

  getItems(params: any) {
    if (!params)
      params = {};

    params.headers = { 'Api-Key': params.connection?.connectionData?.apiKey ?? '' };
    return super.getItems(params);
  }
}
