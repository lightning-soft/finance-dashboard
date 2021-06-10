import { Injectable } from '@angular/core';
import { ExcludeId, Id } from 'communication';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TradeHandler } from 'src/app/components';
import { ConnectionContainer, IOrder, OrderDuration, OrdersRepository, OrderStatus, OrderType } from 'trading';
import { BaseRepository } from './base-repository';

interface IUpdateOrderRequestParams {
  orderId: Id;
  symbol: string;
  exchange: string;
  accountId: Id;
  duration: OrderDuration;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
}

@Injectable()
export class RealOrdersRepository extends BaseRepository<IOrder> implements OrdersRepository {
  protected get suffix(): string {
    return 'Order';
  }

  tradeHandler: TradeHandler;

  onInit() {
    super.onInit();
    this._connectionContainer = this._injector.get(ConnectionContainer);
  }

  protected _mapItemsParams(params: any = {}) {
    const _params = { ...params };

    if (_params.accountId) {
      _params.id = _params.accountId;
      delete _params.accountId;
    }

    if (_params.StartDate == null) _params.StartDate = new Date(0).toUTCString();
    if (_params.EndDate == null) _params.EndDate = new Date(Date.now()).toUTCString();

    return _params;
  }

  protected _responseToItems(res: any, params: any) {
    return res.result.filter((item: any) => this._filter(item, params));
  }

  deleteItem(item: IOrder | Id): Observable<any> {
    if (typeof item !== 'object')
      throw new Error('Invalid order');

    return this._http.post<IOrder>(
      this._getRESTURL(`${item.id}/cancel`),
      null,
      {
        ...this.getApiHeadersByAccount(item.accountId),
        params: {
          AccountId: item?.account?.id,
        } as any
      }
    );
  }

  updateItem(item: IOrder, query?: any): Observable<IOrder> {
    const dto: IUpdateOrderRequestParams = {
      ...item,
      orderId: item.id,
      accountId: item.account.id,
      symbol: item.instrument.symbol,
      exchange: item.instrument.exchange
    };

    return this._http.put<IOrder>(this._getRESTURL(), dto, { ...this.getApiHeadersByAccount(item.accountId), params: query })
      .pipe(tap(this._onUpdate));
  }

  createItem(item: ExcludeId<IOrder>, options?: any): Observable<IOrder> {
    if (this.tradeHandler.tradingEnabled)
      return (super.createItem(item, options) as Observable<{ result: IOrder }>)
        .pipe(map(res => res.result));

    return throwError('You can\'t create order when trading is locked ');
  }

  deleteMany(orders: IOrder[]): Observable<any> {
    if (!Array.isArray(orders))
      return throwError('Please provide array of orders');

    orders = orders.filter(i => i.status == OrderStatus.Pending || i.status == OrderStatus.New || i.status == OrderStatus.PartialFilled);

    if (!orders.length)
      return of(null);

    const map = new Map();

    for (const order of orders) {
      const key = this.getApiKey(order);

      if (!map.has(key)) {
        map.set(key, [order]);
      } else {
        map.get(key).push(order);
      }
    }

    return forkJoin(new Array(map.keys()).map((key: any) =>
      this._http.post(
        this._getRESTURL(`cancel`),
        null,
        {
          ...this.getApiHeaders(key),
          params: {
            orderIds: map.get(key),
            accountId: map.get(key)[0].accountId
          }
        },
      ),
    ));
  }

  protected _filter(item: IOrder, params: any = {}) {
    const { instrument } = params;

    if (instrument) {
      return instrument.symbol === item.instrument.symbol;
    }

    return true;
  }
}
