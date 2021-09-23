import { Injectable } from '@angular/core';
import { ExcludeId, Id, IPaginationResponse } from 'communication';
import { forkJoin, Observable, of, throwError } from 'rxjs';
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
    this.tradeHandler = this._injector.get(TradeHandler);
    this._connectionContainer = this._injector.get(ConnectionContainer);
  }

  protected _mapItemsParams(params: any = {}) {
    const _params = { ...super._mapItemsParams(params) };

    if (_params.accountId) {
      _params.id = _params.accountId;
      delete _params.accountId;
    }

    if (_params.StartDate == null) _params.StartDate = new Date(0).toUTCString();
    if (_params.EndDate == null) _params.EndDate = new Date(Date.now()).toUTCString();

    return _params;
  }

  // _processParams(obj) {
  //   if ((obj as any)?.headers)
  //     delete (obj as any).headers;
  //   /*if ((obj as any)?.accountId)
  //     delete (obj as any).accountId;*/
  // }

  protected _responseToItems(res: any, params: any) {
    return res.result.filter((item: any) => this._filter(item, params));
  }

  play(order: IOrder): Observable<IOrder> {
    return this._http.post<IOrder>(this._getRESTURL(`${ order.id }/play`), null, {
      ...this.getApiHeadersByAccount(order.accountId ?? order.account?.id)
    }).pipe(
      map((item: any) => this._mapResponseItem(item.result)),
      tap(item => this._onCreate(item))) as Observable<IOrder>;
  }

  stop(order: IOrder): Observable<IOrder> {
    return this._http.post<IOrder>(this._getRESTURL(`${ order.id }/stop`), null, {
      ...this.getApiHeadersByAccount(order.accountId ?? order.account?.id)
    }).pipe(
      map((item: any) => {
        const order = item.result;
        order.status = OrderStatus.Stopped;

        return this._mapResponseItem(order);
      }),
      tap(item => this._onUpdate(item))) as Observable<IOrder>;
  }

  getItems(params?: any): Observable<IPaginationResponse<IOrder>> {
    if (!params.accounts && params.id && !params.hideStopped) {
      return forkJoin([super.getItems(params), this.getStoppedItems(params)])
        .pipe(
          map(item => {
            const [ordersResponse, stoppedOrdersResponse] = item;
            return {
              requestParams: ordersResponse.requestParams,
              data: [...ordersResponse.data, ...stoppedOrdersResponse.data.map(item => {
                item.status = OrderStatus.Stopped;
                return item;
              })],
            } as IPaginationResponse;
          }));
    }
    return super.getItems(params);
  }

  getStoppedItems(params) {
    return this._http.get<any>(this._getRESTURL(`${ params.id }/stopped`), {
      ...params
    }).pipe(
      map((item: any) => ({ ...item, data: item.result }))
    );
  }

  deleteItem(item: IOrder | Id): Observable<any> {
    if (typeof item !== 'object')
      throw new Error('Invalid order');

    const accountId = item?.accountId ?? item?.account?.id;

    if (item.status === OrderStatus.Stopped)
      return this._http.delete<IOrder>(this._getRESTURL(`${ item.id }/delete`), {
        ...this.getApiHeadersByAccount(accountId),
        params: {
          AccountId: accountId,
        } as any
      }).pipe(map((res: any) => {
        const order = res.result;
        order.status = OrderStatus.Canceled;
        return order;
      }));

    return this._http.post<IOrder>(
      this._getRESTURL(`${ item.id }/cancel`),
      null,
      {
        ...this.getApiHeadersByAccount(accountId),
        params: {
          AccountId: accountId,
        } as any
      }
    ).pipe(map((res: any) => res.result));
  }

  updateItem(item: IOrder, query?: any): Observable<IOrder> {
    const dto: IUpdateOrderRequestParams = {
      ...item,
      orderId: item.id,
      accountId: item.account?.id,
      symbol: item.instrument.symbol,
      exchange: item.instrument.exchange
    };

    return this._http.put<{ result: IOrder }>(this._getRESTURL(), dto, {
      ...this.getApiHeadersByAccount(item.accountId ?? dto.accountId),
      params: query
    }).pipe(
      map((response: any) => this._mapResponseItem(response.result)),
      tap(this._onUpdate),
    );
  }

  createItem(item: ExcludeId<IOrder>, options?: any): Observable<IOrder> {
    if (this.tradeHandler.tradingEnabled)
      return (super.createItem(item, { ...options, ...this.getApiHeadersByAccount(item.accountId) }) as Observable<IOrder>);

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

    return forkJoin(Array.from(map.keys()).map((key: any) =>
      this._http.post(
        this._getRESTURL(`cancel`),
        null,
        {
          headers: {
            ...this.getApiHeaders(key),
          },
          params: {
            orderIds: map.get(key).map(item => item.id),
            accountId: map.get(key)[0].account.id
          }
        },
      ),
    ));
  }

  _mapResponseItem(item: IOrder) {
    item.description = item.instrument.description ?? '';

    return item;
  }

  protected _filter(item: IOrder, params: any = {}) {
    const { instrument } = params;

    if (instrument) {
      return instrument.symbol === item.instrument.symbol;
    }

    return true;
  }
}
