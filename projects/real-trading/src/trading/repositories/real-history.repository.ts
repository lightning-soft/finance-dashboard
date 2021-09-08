import { Injectable } from '@angular/core';
import { IBaseItem } from 'communication';
import { IBar } from 'chart';
import { BaseRepository } from './base-repository';
import { HistoryRepository } from 'trading';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar {
}

const requestOffset = 1000; // 1s

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

    // return of({ data: hist.map(i => this._mapResponseItem(i)), total: hist.length });
    if (params.Periodicity === 'TICK')
      return fromPromise(this._getItems(params));

    return super.getItems(params);
  }

  private async _getItems(params: any): Promise<{ data: any }> {
    try {
      let { startDate, endDate } = params;
      const data = [];
      let isOver = false;
      do {
        await super.getItems({ ...params, startDate }).pipe(
          tap((res) => {
            const arr = res?.data || [];
            if (!arr.length) {
              isOver = true;
              return;
            }

            const lastItem = arr[arr.length - 1];
            const newStartDate = lastItem?.date.getTime();
            if (newStartDate === startDate) {
              isOver = true;
              return;
            }

            for (const item of (arr || [])) {
              if (item.date.getTime() > startDate) {
                data.push(item);
              }
            }
            startDate = newStartDate;
          }),
        ).toPromise();
      }
      while (!isOver && endDate > startDate);
      return { data };
    } catch (err) {
      console.log(err);
      return { data: [] };
    }
  }
}
