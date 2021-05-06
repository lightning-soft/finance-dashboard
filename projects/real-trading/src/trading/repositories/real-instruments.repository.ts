import { Injectable } from '@angular/core';
import { Id, IPaginationResponse } from 'communication';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IInstrument } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealInstrumentsRepository extends BaseRepository<IInstrument> {
  protected get suffix(): string {
    return 'Instrument';
  }

  private _store: { [key: string]: IInstrument } = {};

  async getStoredItem(item: IInstrument): Promise<IInstrument> {
    const id = this._getId(item);

    if (this._store[id]) {
      return this._store[id];
    }

    return this.getItemById(item.symbol, { exchange: item.exchange }).toPromise();
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
        const item = {
          ...result,
          id: result.symbol,
          tickSize: result.increment,
        };

        this._storeItem(item);

        return item;
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
          const item = {
            id: symbol,
            symbol,
            exchange,
            tickSize: 0.01,
          };

          this._storeItem(item);

          return item;
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

  private _storeItem(item: IInstrument) {
    const id = this._getId(item);

    this._store[id] = item;
  }

  private _getId(item: IInstrument): string {
    return `${item.exchange}.${item.symbol}`;
  }
}
