import { FakeRepository, IPaginationResponse } from 'communication';
import { from, Observable } from 'rxjs';
import { IInstrument } from 'trading';

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

  getItemsByIds(ids: string[] | number[]): Observable<IInstrument[]> {
    if (this.loaded)
      return super.getItemsByIds(ids);

    return from(
      this._getItems()
        .then((data: IInstrument[]) => {
            return data.filter((instrument: IInstrument) => {
              return (ids as string[]).includes(instrument.id as string);
            });
          }
        )
    );
  }
}
