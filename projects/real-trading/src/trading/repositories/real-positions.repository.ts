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
        const data = res.result.map((item: any) => {
          const { averageFillPrice: price, volume: size, instrument } = item;

          return {
            id: instrument.exchange + instrument.symbol,
            instrument,
            accountId: item.account.id,
            price,
            size,
            realized: item.realisedPL,
            unrealized: 0,
            total: size * price,
            side: item.type,
            status: PositionStatus.Open,
          };
        });

        return { data } as IPaginationResponse<IPosition>;
      }),
    );
  }

  deleteItem(item: IPosition | Id) {
    if (typeof item !== 'object')
      throw new Error('Invalid position');

    return this._http.post<IPosition>(
      this._getRESTURL(item.accountId),
      null,
      {
        ...this._httpOptions,
        params: {
          Symbol: item.instrument.symbol,
          Exchange: item.instrument.exchange,
        }
      })
      .pipe(tap(this._onUpdate));
  }
}
