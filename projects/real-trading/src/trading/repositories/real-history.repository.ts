import { Injectable } from '@angular/core';
import { IBaseItem } from 'communication';
import { IBar } from 'chart';
import { BaseRepository } from './base-repository';
import { HistoryRepository } from 'trading';
import { Observable } from 'rxjs';

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar {
}

const maxTickDateGap = 4 * 24 * 60 * 60 * 1000; // 4 days
const requestGap = 3 * 24 * 60 * 60 * 1000; // 3 days

@Injectable()
export class RealHistoryRepository extends BaseRepository<IHistoryItem> implements HistoryRepository {
  protected get suffix(): string {
    return 'History';
  }

  protected _mapResponseItem(item: any): IHistoryItem {
    return {
      id: item.id,
      date: moment.utc(item.timestamp).toDate(),
      open: item.openPrice,
      close: item.closePrice,
      high: item.highPrice,
      low: item.lowPrice,
      volume: item.volume,
      details: item.details ?? [],
    };
  }

  getItems(params: any): Observable<any> {
    if (!params.endDate)
      params.endDate = new Date();

    if (typeof params.startDate !== 'number')
      params.startDate = params.startDate?.getTime();
    if (typeof params.endDate !== 'number')
      params.endDate = params.endDate.getTime();

    if (params?.productCode) {
      params.id = params.productCode;
      delete params.productCode;
    } else if (params?.Symbol) {
      params.id = params.Symbol;
    } else if (params?.id) {
      const [symbol, exchange] = params.id.split('.');
      params.id = symbol;
      params.Exchange = exchange || params.Exchange;
    }

    if (params.Periodicity === 'TICK' && params.endDate - params.startDate > maxTickDateGap) {
      const startDate = new Date(params.endDate - requestGap);
      startDate.setHours(0, 0, 0);
      params.startDate = startDate.getTime();
    }


    // const { endDate } = params || {};

    // return of({ data: hist.map(i => this._mapResponseItem(i)), requestParams: params,  total: hist.length, pageCount: 1, page: 1 } as any);

    return super.getItems(params);
  }
}
