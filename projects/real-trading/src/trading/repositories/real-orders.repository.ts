import { Id, IPaginationResponse } from 'communication';
import { map } from 'rxjs/operators';
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

  getItems(params: any = {}) {
    const _params = { ...params };

    if (_params.accountId) {
      _params.id = _params.accountId;
      delete _params.accountId;
    }

    if (_params.StartDate == null) _params.StartDate = new Date(0).toUTCString();
    if (_params.EndDate == null) _params.EndDate = new Date(Date.now()).toUTCString();

    return super.getItems(_params).pipe(
      map((res: any) => {
        const data = res.result
          .filter((item: any) => this._filter(item, _params));

        return { data } as IPaginationResponse<IOrder>;
      }),
    );
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
      }
    );
  }

  protected _filter(item: IOrder, params: any = {}) {
    const { instrument } = params;

    if (instrument) {
      return instrument.symbol === item.instrument.symbol;
    }

    return true;
  }
}
