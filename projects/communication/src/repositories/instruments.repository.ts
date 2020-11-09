import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IInstrument } from 'trading';
import { IPaginationResponse } from '../common';
import { BrokerRepository } from './broker.repository';

@Injectable({
  providedIn: 'root',
})
export class InstrumentsRepository extends BrokerRepository<IInstrument> {
  protected _itemName = 'Instrument';

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
