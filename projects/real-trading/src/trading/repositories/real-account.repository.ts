import { HttpRepository } from 'communication';
import { map } from 'rxjs/operators';
import { AccountRepository, IAccount } from 'trading';

export class RealAccountRepository extends HttpRepository<IAccount> implements AccountRepository {
  protected get suffix(): string {
    return 'Account';
  }

  protected get _baseUrl(): string {
    return this._communicationConfig.rithmic.http.url + this.suffix;
  }

  getItems(params: any) {
    if (!params)
      params = {};
    const connection = params.connection;
    // Todo Test this!!!!
    delete params.connection;

    params.headers = { 'Api-Key': connection?.connectionData?.apiKey ?? '' };
    return super.getItems(params)
      .pipe(map((res) => ({ ...res, data: res.data.map(item => ({ ...item, connectionId: connection.id })) })));
  }
}
