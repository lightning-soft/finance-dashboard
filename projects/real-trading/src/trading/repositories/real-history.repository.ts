import { Injectable } from '@angular/core';
import { IBaseItem } from 'communication';
import { IBar } from 'chart';
import { BaseRepository } from './base-repository';
import { HistoryRepository } from "trading";
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar { }
const requestFormat = 'YYYY-MM-DD HH:mm:ss';

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
      details: (item.details ?? []).map(i => ({
        ...i,
        tradesCount: i.bidInfo.tradesCount + i.askInfo.tradesCount,
      })),
    };
  }

  getItems(params: any) {
    params.startDate = moment(params.startDate).format(requestFormat);
    params.endDate = moment(params.endDate).format(requestFormat);

    if (params?.Symbol) {
      params.id = params.Symbol;
    } else if (params?.id) {
      const [symbol, exchange] = params.id.split('.');
      params.id = symbol;
      params.Exchange = exchange;
    }

    const { endDate } = params || {};

    return super.getItems(params).pipe(
      switchMap((res: any) => {
        const arr = res?.data || [];
        const lastItem = arr[arr.length - 1];
        const lastDate = lastItem?.date;
        const requestEndDate = endDate && new Date(endDate);

        if (requestEndDate != null && lastItem != null && lastDate < requestEndDate)
          return this.getItems({ ...params, startDate: lastDate, endDate: requestEndDate })
            .pipe(
              map((response: any) => {
                const data = arr;

                for (const item of (response.data || [])) {
                  if (item.date > lastDate) {
                    data.push(item);
                  }
                }

                return { data };
              }),
            );

        return of(res);
      })
    );
  }
}
