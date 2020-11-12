import { IOrder } from 'trading';
import { BaseRepository } from './base-repository';

export class RealOrdersRepository extends BaseRepository<IOrder> {
  protected get suffix(): string {
    return 'Order';
  }

  _getRepository() {
    return new RealOrdersRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params) {
    if (params?.accountId) {
      params.id = params.accountId;
      delete params.accountId;
    }

    return super.getItems(params);
  }
}
