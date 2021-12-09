import { Injectable } from '@angular/core';
import { Id, IPaginationResponse } from 'communication';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { IInstrument, InstrumentsRepository, InstrumentType } from 'trading';
import { BaseRepository } from './base-repository';

const monthsMap = {
  F: 'Jan',
  G: 'Feb',
  H: 'Mar',
  J: 'Apr',
  K: 'May',
  M: 'Jun',
  N: 'Jul',
  Q: 'Aug',
  U: 'Sep',
  V: 'Oct',
  X: 'Nov',
  Z: 'Dec',
};

@Injectable()
export class RealInstrumentsRepository extends BaseRepository<IInstrument> implements InstrumentsRepository {
  protected _cacheEnabled = true;

  protected get suffix(): string {
    return 'Instrument';
  }

  rollInstrument(instrument: IInstrument, query): Observable<IInstrument> {
    const { headers, ...params } = this._mapItemParams(query);

    return this._http.get<{ result: IInstrument[] }>(this._getRESTURL() + 'pack',
      {
        ...this._httpOptions,
        headers,
        params: { ...params, symbol: instrument.symbol, exchange: instrument.exchange }
      })
      .pipe(
        map(response => response.result.map(item => {
          item.id = `${item.symbol}.${item.exchange}`;
          return item;
        })),
        map(result => {
          const index = result.findIndex(item => item.id === instrument.id);
          return result[(index + 1) % result.length];
        })
      );
  }

  protected _mapItemsParams(params: any = {}) {
    return {
      criteria: '',
      ...super._mapItemsParams(params),
    };
  }

  protected _mapResponseItem(item: any): IInstrument {
    let suffix = '';
    if (item.type === InstrumentType.Future && item.symbol > 2) {
      const [monthType, year] = item.symbol.replace(item.productCode, '');
      const decade = new Date().getFullYear().toString()[2];
      suffix = monthsMap[monthType] + `${decade}${year}`;
    }
    return {
      ...item,
      id: item.symbol,
      description: item.description + ` ${suffix}`,
      tickSize: item.increment ?? 0.01,
    };
  }

  getItemById(id, query?): Observable<IInstrument> {
    const [symbol, exchange] = id.split('.');

    if (!query)
      query = {};

    if (query?.exchange == null && exchange != null) {
      id = symbol;
      query.exchange = exchange;
    }

    return super.getItemById(id, query).pipe(
      mergeMap((result: any) => {
        if (!result) {
          console.error(result);
          return throwError(`Invalid response, ${result}`);
        }

        return of({
          ...result,
          id: `${result.symbol}.${result.exchange}`,
          tickSize: result.increment ?? 0.01,
        });
      }),
    );
  }

  getItems(params = {}): Observable<IPaginationResponse<IInstrument>> {
    const _params = {
      criteria: '',
      ...params,
    };

    return super.getItems(_params).pipe(
      map((res: any) => {
        const data = res.data.map(({ symbol, exchange, contractSize, precision, increment, description, ...rest }) => {
          return {
            ...rest,
            id: `${symbol}.${exchange}`,
            symbol,
            description,
            exchange,
            contractSize,
            tickSize: increment ?? 0.01,
            precision,
          };
        });

        return { data, } as IPaginationResponse<IInstrument>;
      }),
    );
  }

  getItemsByIds(ids?: Id[]): Observable<IInstrument[]> {
    if (!ids || !ids.length) {
      return of([]);
    }

    // return this.getItems({ s: JSON.stringify({ id: { $in: ids } }) }).pipe(map(i => i as any));
    return forkJoin(ids.map(id => this.getItemById(id)));
  }
}
