import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IPaginationResponse, Repository, RithmicService } from 'communication';
import { IInstrument } from '../models/instruemnt';

@Injectable()
export class InstrumentsRepository extends Repository<IInstrument> {
  constructor(private _rithmicService: RithmicService) {
    super();
  }

  getItemById(id) {
    return this._rithmicService.getInstrument(id);
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
    return this._rithmicService.getInstruments(params.criteria);
  }
}
