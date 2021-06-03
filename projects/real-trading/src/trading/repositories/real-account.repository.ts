import { AccountRepository, IAccount } from 'trading';
import { BaseRepository } from './base-repository';

export class RealAccountRepository extends BaseRepository<IAccount> implements AccountRepository {
  protected get suffix(): string {
    return 'Account';
  }

  protected _mapResponseItem(item: any): IAccount {
    return {
      ...item,
      connectionId: this.connection.id,
    };
  }
}
