import { Injectable } from '@angular/core';
import { IBaseItem } from 'communication';
import { IBar } from 'chart';
import { BaseRepository } from './base-repository';
import { CustomPeriodicity, HistoryRepository } from 'trading';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

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
      close: item.settlementPrice !== 'NaN' ? item.settlementPrice : item.closePrice,
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

    if (params.Exchange === 'FAIRX'){
      params.id = params.Symbol;
    } else if (params?.Symbol) {
      params.id = params.Symbol;
    } else if (params?.productCode) {
      params.id = params.productCode;
      delete params.productCode;
    } else if (params?.id) {
      const [symbol, exchange] = params.id.split('.');
      params.id = symbol;
      params.Exchange = exchange || params.Exchange;
    }
    if (params.Periodicity === CustomPeriodicity.RENKO) {
      return this.makeRequest(params, '/renko');
    } else if (params.Periodicity === CustomPeriodicity.REVS) {
      const { headers, ...allParams } = this._mapItemsParams(params);
      allParams.Periodicity = CustomPeriodicity.TICK;
      return this._http.get(this._communicationConfig.rithmic.http.url + 'Indicators/' + params.id + '/RevBars', {
        params: new HttpParams({ fromObject: allParams }),
        headers
      }).pipe(
        map(({ result }: any) => {
          return {
            additionalInfo: {
              isUp: result.isUp,
            }, ...this._mapItemsResponse(result.bars, params)
          };
        }),
      );
    }
    // const { endDate } = params || {};

    // return of({ data: hist.map(i => this._mapResponseItem(i)), requestParams: params,  total: hist.length, pageCount: 1, page: 1 } as any);

    return super.getItems(params)
      .pipe(map((res) => {
        const { requestParams, data } = res;
        if (requestParams.Periodicity === CustomPeriodicity.TICK)
          res.data = res.data.map(item => {
            item.ticksCount = requestParams.BarSize;
            return item;
          });
        return res;
      }));
  }

  makeRequest(params, path) {
    const { headers, ...allParams } = this._mapItemsParams(params);
    allParams.Periodicity = CustomPeriodicity.TICK;
    return this._http.get(this._communicationConfig.rithmic.http.url + 'indicators/' + params.id + path, {
      params: new HttpParams({ fromObject: allParams }),
      headers
    }).pipe(
      map(item => this._mapItemsResponse(item, params)),
    );
  }
}
