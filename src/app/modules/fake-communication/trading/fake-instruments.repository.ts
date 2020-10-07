import { IInstrument } from 'communication';
import { IPaginationResponse } from 'core';
import { from, Observable } from 'rxjs';
import { FakeRepository } from '../common';

export class FakeInstrumentsRepository extends FakeRepository<IInstrument> {
  loaded = false;

  protected async _getItems() {
    const symbolsFilePath = './assets/instruments.json';
    const response = await fetch(symbolsFilePath);
    const data = await response.json();
    this.loaded = true;
    return data.map(i => ({ tickSize: 0.01, id: i.symbol, name: i.symbol, ...i })).splice(0, 100);
  }

  getItems(params?: { skip: number, take: number }): Observable<IPaginationResponse<IInstrument>> {
    if (this.loaded)
      return super.getItems(params);

    return from(this._getItems().then(data => ({ data }) as any));
  }
}
