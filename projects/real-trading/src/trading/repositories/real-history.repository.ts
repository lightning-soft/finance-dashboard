import { Injectable } from '@angular/core';
import { IBaseItem } from 'communication';
import { IBar } from 'chart';
import { BaseRepository } from './base-repository';
import { HistoryRepository } from "trading";

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar {
}

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
      details: item.details ?? [],
    };
  }

  getItems(params: any) {
    if (typeof params.startDate !== 'number')
      params.startDate = params.startDate?.getTime();
    if (typeof params.endDate !== 'number')
      params.endDate = params.endDate.getTime();

    if (params?.productCode)
      params.id = params.productCode;
    else if (params?.Symbol) {
      params.id = params.Symbol;
    } else if (params?.id) {
      const [symbol, exchange] = params.id.split('.');
      params.id = symbol;
      params.Exchange = exchange;
    }

    const { endDate } = params || {};

    return super.getItems(params).pipe(
/*      switchMap((res: IPaginationResponse<IHistoryItem>) => {
        const arr = res?.data || [];
        const lastItem = arr[arr.length - 1];
        const lastDate = lastItem?.date.getTime();
        const requestEndDate = endDate && new Date(endDate).getTime();

        if (requestEndDate != null && lastItem != null && lastDate < requestEndDate) {
          lastItem.details = lastItem.details.filter(details => {
            return lastItem.low <= details.price && details.price <= lastItem.high;
          });

          return this.getItems({ ...params, startDate: lastDate, endDate: requestEndDate })
            .pipe(
              map((response: IPaginationResponse<IHistoryItem>) => {
                const data = arr;

                for (const item of (response.data || [])) {
                  if (item.date.getTime() > lastDate) {
                    data.push(item);
                  }
                }

                return { data };
              }),
            );
        }

        return of(res);
      })*/
    );
  }
}
