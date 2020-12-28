import { Injectable } from '@angular/core';
import { IBaseItem, IPaginationResponse } from 'communication';
import { IBar } from 'projects/chart/src/models/chart';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseRepository } from './base-repository';

declare const moment: any;

export interface IHistoryItem extends IBaseItem, IBar {}

@Injectable()
export class RealHistoryRepository extends BaseRepository<IHistoryItem> {
  protected get suffix(): string {
    return 'History';
  }

  _getRepository() {
    return new RealHistoryRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params: { id: string }): Observable<IPaginationResponse<IHistoryItem>> {
    return super.getItems(params).pipe(
      map((res: any) => {
        const data = res.result.map(item => ({
          date: moment.utc(item.timestamp * 1000).toDate(),
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
