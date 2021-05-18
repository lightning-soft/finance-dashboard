import { Injectable } from '@angular/core';
import { Id, IPaginationResponse } from 'communication';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IInstrument, InstrumentsRepository } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealInstrumentsRepository extends BaseRepository<IInstrument> implements InstrumentsRepository {
  protected _cacheEnabled = true;

  protected get suffix(): string {
    return 'Instrument';
  }

  _getRepository() {
    return new RealInstrumentsRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItemById(id, query?): Observable<IInstrument> {
    return super.getItemById(id, query).pipe(
      map(({ result }: any) => {
        return {
          ...result,
          id: result.symbol,
          tickSize: result.increment,
        };
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
        const data = res.result.map(({ symbol, exchange }) => {
          return {
            id: symbol,
            symbol,
            exchange,
            tickSize: 0.01,
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
