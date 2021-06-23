import { Id, IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IDeletePositionsParams, IPosition, PositionsRepository, PositionStatus } from 'trading';
import { BaseRepository } from './base-repository';

export class RealPositionsRepository extends BaseRepository<IPosition> implements PositionsRepository {
  protected get suffix(): string {
    return 'Position';
  }
  static transformPosition(item, connectionId?): IPosition {
    if (isPositionTransformed(item))
      return item;

    const { averageFillPrice: price, volume: size, instrument } = item;

    return {
      id: `${instrument.id}.${item.account?.id}`,
      instrument,
      accountId: item.account?.id,
      price,
      size,
      sellVolume: item.sellVolume,
      buyVolume: item.buyVolume,
      realized: item.realisedPL,
      unrealized: 0,
      total: size * price,
      side: item.type,
      connectionId: connectionId ?? item.connectionId,
      status: PositionStatus.Open,
    };
  }

  getItems(params: any = {}) {
    const _params = { ...params };

    if (_params.accountId) {
      _params.id = _params.accountId;
      // delete _params.accountId;
      // needed to exit eternal recursion
    } else if (_params.hasOwnProperty('connectionId') && !_params.hasOwnProperty('accounts')){
      _params.accounts = this._connectionContainer.getAccountsByConnection(params.connectionId);
    }

    return super.getItems(_params).pipe(
      map((res: any) => {
        const data = res.data
          .filter((item: any) => this._filter(item, _params))
          .map((item: any) => {
            return RealPositionsRepository.transformPosition(item);
          });

        return { data } as IPaginationResponse<IPosition>;
      }),
    );
  }

  deleteItem(item: IPosition | Id): Observable<any> {
    if (typeof item !== 'object')
      throw new Error('Invalid position');

    return this._http.post<IPosition>(
      this._getRESTURL(item.accountId),
      null,
      {
        ...this.getApiHeadersByAccount(item.accountId),
        params: {
          Symbol: item.instrument.symbol,
          Exchange: item.instrument.exchange,
        }
      }
    );
  }

  deleteMany({ accountId, ...params }: IDeletePositionsParams | any): Observable<any> {
    return this._http.post(this._getRESTURL(accountId), null, { ...this.getApiHeadersByAccount(accountId), params });
  }

  protected _filter(item: IPosition, params: any = {}) {
    const { instrument } = params;

    if (instrument) {
      return instrument.symbol === item.instrument.symbol;
    }

    return true;
  }
}

function isPositionTransformed(position: IPosition | any): position is IPosition {
  return (position as IPosition).accountId !== undefined && position.id !== undefined;
}
