import { Injectable } from '@angular/core';
import { Id, IPaginationResponse } from 'communication';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { flatMap, map, mergeMap } from 'rxjs/operators';
import { IInstrument, InstrumentsRepository } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealInstrumentsRepository extends BaseRepository<IInstrument> implements InstrumentsRepository {
  protected _cacheEnabled = true;

  protected get suffix(): string {
    return 'Instrument';
  }

  protected _mapItemsParams(params: any = {}) {
    return {
      criteria: '',
      ...params,
    };
  }

  protected _mapResponseItem(item: any): IInstrument {
    return {
      ...item,
      id: item.symbol,
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
      mergeMap((data: any) => {
        const result = data.result;
        if (!result) {
          console.error(data);
          return throwError(`Invalid response, ${data}`);
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
        const data = res.data.map(({ symbol, exchange, contractSize, precision, increment, description  }) => {
          return {
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
