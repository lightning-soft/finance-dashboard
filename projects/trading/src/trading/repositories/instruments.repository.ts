import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IPaginationResponse, Repository, RithmicApiService } from 'communication';
import { IInstrument } from '../models/instruemnt';

@Injectable()
export class InstrumentsRepository extends Repository<IInstrument> {
  constructor(private _rithmicApiService: RithmicApiService) {
    super();
  }

  getItemById(id) {
    return this._rithmicApiService.getInstrument(id);
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

  getItems(params?: { criteria?: string }): Observable<IPaginationResponse<IInstrument>> {
    return this._rithmicApiService.getInstruments(params.criteria);
  }
}
