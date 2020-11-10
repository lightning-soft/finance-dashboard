import { Injectable } from '@angular/core';
import { IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IInstrument } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealInstrumentsRepository extends BaseRepository<IInstrument> {
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

  getItemById(id): Observable<IInstrument> {
    return super.getItemById(id).pipe(
      map((res: any) => res.result),
    );
  }

  getItems(params = {}): Observable<IPaginationResponse<IInstrument>> {
    const _params = {
      criteria: '',
      ...params,
    };

    return super.getItems(_params).pipe(
      map((res: any) => {
        const data = res.result.map(({ symbol, exchange }) => ({
          id: symbol,
          symbol,
          exchange,
          tickSize: 0.01,
        }));

        return { data, } as IPaginationResponse<IInstrument>;
      }),
    );
  }
}
