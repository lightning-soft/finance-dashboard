import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector, Optional } from '@angular/core';
import { CommunicationConfig, ExcludeId, Id, IPaginationResponse } from 'communication';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { TradeHandler } from 'src/app/components';
import { IOrder, OrderStatus } from 'trading';
import { BaseRepository } from './base-repository';

@Injectable()
export class RealOrdersRepository extends BaseRepository<IOrder> {
  protected get suffix(): string {
    return 'Order';
  }

  constructor(@Inject(TradeHandler) public tradeHandler: TradeHandler,
    @Inject(HttpClient) protected _http: HttpClient,
    @Optional() @Inject(CommunicationConfig) protected _communicationConfig: CommunicationConfig,
    @Optional() @Inject(Injector) protected _injector: Injector
  ) {
    super(_http, _communicationConfig, _injector);
  }

  _getRepository() {
    return new RealOrdersRepository(
      this.tradeHandler,
      this._http,
      this._communicationConfig,
      this._injector
    );
  }

  getItems(params: any = {}) {
    const _params = { ...params };

    if (_params.accountId) {
      _params.id = _params.accountId;
      delete _params.accountId;
    }

    if (_params.StartDate == null) _params.StartDate = new Date(0).toUTCString();
    if (_params.EndDate == null) _params.EndDate = new Date(Date.now()).toUTCString();

    return super.getItems(_params).pipe(
      map((res: any) => {
        const data = res.result
          .filter((item: any) => this._filter(item, _params));

        return { data } as IPaginationResponse<IOrder>;
      }),
    );
  }

  deleteItem(item: IOrder | Id) {
    if (typeof item !== 'object')
      throw new Error('Invalid order');

    return this._http.post<IOrder>(
      this._getRESTURL(`${item.id}/cancel`),
      null,
      {
        ...this._httpOptions,
        params: {
          AccountId: item?.account?.id,
        } as any
      }
    );
  }

  createItem(item: ExcludeId<IOrder>, options?: any): Observable<any> {
    if (this.tradeHandler.tradingEnabled)
      return super.createItem(item, options);
    else {
      return throwError('You can\'t create order when trading is locked ');
    }
  }

  deleteMany(orders: IOrder[]): Observable<any> {
    if (!Array.isArray(orders))
      return throwError('Please provide array of orders');

    orders = orders.filter(i => i.status == OrderStatus.Pending || i.status == OrderStatus.New || i.status == OrderStatus.PartialFilled);
    if (!orders.length)
      return of(null);

    const orderIds = orders.map(i => i.id.toString());
    const accountId: any = orders[0].accountId ?? orders[0].account?.id;

    return this._http.post(this._getRESTURL(`cancel`), null, { ...this._httpOptions, params: { orderIds, accountId } });
  }

  protected _filter(item: IOrder, params: any = {}) {
    const { instrument } = params;

    if (instrument) {
      return instrument.symbol === item.instrument.symbol;
    }

    return true;
  }
}
