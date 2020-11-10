import { IOrder, IConnection } from 'trading';
import { Repository } from 'communication';

export abstract class OrdersRepository extends Repository<IOrder> {
  abstract forConnection(connection: IConnection);
}
