import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPaginationResponse, Repository, RITHMIC_API_URL } from 'communication';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IInstrument } from '../models/instruemnt';

@Injectable()
export class InstrumentsRepository extends Repository<IInstrument> {
  constructor(private _httpClient: HttpClient) {
    super();
  }

  getItemById(id) {
    return this._httpClient.get(`${RITHMIC_API_URL}Instrument/${id}`).pipe(
      map((res: any) => res.result),
    );
  }

  createItem() {
    return of({} as IInstrument); // TODO
  }

  updateItem() {
    return of({} as IInstrument); // TODO
  }

  deleteItem() {
    return of(true); // TODO
  }

  getItems(params?: { skip?: number, take?: number, criteria?: string }): Observable<IPaginationResponse<IInstrument>> {
    const criteria = params?.criteria || 'ES';

    return this._httpClient.get(`${RITHMIC_API_URL}Instrument?criteria=${criteria}`)
      .pipe(
        map((res: any) => {
          const data: IInstrument[] = res.result.map(({ symbol, exchange }) => ({
            id: symbol,
            name: symbol,
            exchange,
            tickSize: 0.01,
          }));

          return { data } as IPaginationResponse;
        })
      );
  }
}
