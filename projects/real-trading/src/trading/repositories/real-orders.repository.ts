import { Id } from 'communication';
import { map, tap } from 'rxjs/operators';
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
    params = { ...params };
    if (params?.accountId) {
      params.id = params.accountId;

      delete params.accountId;
    }

    if (params.StartDate == null) params.StartDate = new Date(0).toUTCString();
    if (params.EndDate == null) params.EndDate = new Date(Date.now()).toUTCString();

    return super.getItems(params).pipe(map((response: any) => ({ data: response.result } as any)));
  }

  deleteItem(item: IOrder | Id) {
    if (typeof item !== 'object')
      throw new Error('Invalid order');

    return this._http.post<IOrder>(
      this._getRESTURL(`${item.id}/cancel`),
      null,
      {
        ...this._httpOptions,
        params: {
          AccountId: item?.account?.id,
        } as any
      })
      .pipe(tap(this._onUpdate));
  }
}
