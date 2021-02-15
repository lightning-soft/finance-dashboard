import { Repository } from 'communication';
import { IConnection, IOrderBook } from 'trading';

export abstract class OrderBooksRepository extends Repository<IOrderBook> {
  abstract forConnection(connection: IConnection);
}
