import { Repository } from 'communication';
import { IOrder } from 'trading';
import { Observable } from 'rxjs';

export abstract class OrdersRepository extends Repository<IOrder> {
  abstract play(order: IOrder): Observable<IOrder>;
  abstract stop(order: IOrder): Observable<IOrder>;
  abstract getStoppedItems(params): Observable<IOrder>;
}
