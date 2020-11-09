import { IOrder } from 'trading';
import { Repository } from 'communication';


export abstract class OrdersRepository extends Repository<IOrder> {

}
