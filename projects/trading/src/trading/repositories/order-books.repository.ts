import { Repository } from 'communication';
import { IOrderBook } from 'trading';

export abstract class OrderBooksRepository extends Repository<IOrderBook> {
}
