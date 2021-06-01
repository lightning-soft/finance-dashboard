import { Injectable } from '@angular/core';
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
}
