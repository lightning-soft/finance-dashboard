import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { CommunicationConfig, IPaginationResponse } from 'communication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IOrderBook } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealOrderBooksRepository extends BaseRepository<IOrderBook> {
  protected get suffix(): string {
    return 'OrderBook';
  }

  constructor(@Inject(HttpClient) protected _http: HttpClient,
    @Optional() @Inject(CommunicationConfig) protected _communicationConfig: CommunicationConfig,
    @Optional() @Inject(Injector) protected _injector: Injector
  ) {
    super(_http, _communicationConfig, _injector);
  }

  _getRepository() {
    return new RealOrderBooksRepository(
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params: any = {}): Observable<IPaginationResponse<IOrderBook>> {
    const _params = { ...params };

    if (_params.symbol) {
      _params.id = _params.symbol;
      delete _params.symbol;
    }

    return super.getItems(_params).pipe(
      map((res: any) => {
        const result = res.result;

        return {
          data: [result],
        } as IPaginationResponse<IOrderBook>;
      }),
    );
  }
}
