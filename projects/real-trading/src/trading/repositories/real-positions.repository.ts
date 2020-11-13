import { Id, IPaginationResponse } from 'communication';
import { map, tap } from 'rxjs/operators';
import { IPosition, PositionStatus } from 'trading';
import { BaseRepository } from './base-repository';

export class RealPositionsRepository extends BaseRepository<IPosition> {
  protected get suffix(): string {
    return 'Position';
  }

  _getRepository() {
    return new RealPositionsRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params) {
    params.id = params.accountId;
    delete params.accountId;
    return super.getItems(params).pipe(
      map((res: any) => {
        const data = res.result.map((item: any) => ({
          account: item.account.id,
          price: item.averageFillPrice,
          size: item.volume,
          realized: item.realisedPL,
          unrealized: 0,
          total: item.averageFillPrice,
          side: item.type,
          status: PositionStatus.Open,
        }));

        return { data } as IPaginationResponse<IPosition>;
      }),
    );
  }

  deleteItem(item: IPosition | Id) {
    if (typeof item !== 'object')
      throw new Error('Invalid order');

    const accountId = item.account;
    return this._http.patch<IPosition>(
      this._getRESTURL(accountId),
      null,
      {
        ...this._httpOptions,
        // params: {
        //   Symbol: item.symbol,
        //   Exchange: item.exchange,
        // }
      })
      .pipe(tap(this._onUpdate));
  }
}
