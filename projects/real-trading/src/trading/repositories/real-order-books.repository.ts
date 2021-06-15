import { Injectable } from '@angular/core';
import { IOrderBook } from 'trading';
import { BaseRepository } from './base-repository';
import { IPaginationResponse } from 'communication';

@Injectable()
export class RealOrderBooksRepository extends BaseRepository<IOrderBook> {
  protected get suffix(): string {
    return 'OrderBook';
  }

  protected _mapItemsParams(params: any = {}) {
    const _params = { ...super._mapItemsParams(params) };

    if (_params.symbol) {
      _params.id = _params.symbol;
      delete _params.symbol;
    }

    return _params;
  }

  protected _mapItemsResponse(res: any, params: any) {
    return { requestParams: params, data: [res.result] } as IPaginationResponse<IOrderBook>;
  }
}
