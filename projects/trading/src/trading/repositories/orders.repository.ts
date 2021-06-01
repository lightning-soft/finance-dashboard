import { Repository } from 'communication';
import { IOrder } from 'trading';

export abstract class OrdersRepository extends Repository<IOrder> {
}
