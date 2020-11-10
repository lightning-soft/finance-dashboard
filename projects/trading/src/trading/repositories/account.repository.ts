import { Repository } from 'communication';
import { IAccount, IConnection } from 'trading';

export abstract class AccountRepository extends Repository<IAccount> {
  abstract forConnection(connection: IConnection);
}
