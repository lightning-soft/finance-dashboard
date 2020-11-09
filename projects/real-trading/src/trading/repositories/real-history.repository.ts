import { Injectable } from '@angular/core';
import { IBar } from 'projects/chart/src/models/chart';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBaseItem, IPaginationResponse } from '../common';
import { BrokerRepository } from './broker.repository';

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar {}

@Injectable({
  providedIn: 'root',
})
export class HistoryRepository extends BrokerRepository<IHistoryItem> {
  protected _itemName = 'History';

  getItems(params: { id: string }): Observable<IPaginationResponse<IHistoryItem>> {
    return super.getItems(params).pipe(
      map((res: any) => {
        const data = res.result.map(item => ({
          date: moment.utc(item.timestamp).toDate(),
          open: item.openPrice,
          close: item.closePrice,
          high: item.highPrice,
          low: item.lowPrice,
          volume: item.volume,
        }));

        return { data } as IPaginationResponse<IHistoryItem>;
      }),
    );
  }
}
