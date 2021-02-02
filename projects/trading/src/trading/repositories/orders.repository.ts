import { Repository } from 'communication';
import { IConnection, IOrder } from 'trading';

export abstract class OrdersRepository extends Repository<IOrder> {
  abstract forConnection(connection: IConnection);
}
