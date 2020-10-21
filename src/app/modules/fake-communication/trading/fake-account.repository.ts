import { IAccount } from 'communication';
import { FakeRepository } from '../common';

export class FakeAccountRepository extends FakeRepository<IAccount> {

  protected _store = {
    1: {name: 'CV', id: 1, connected: true, server: 'aaa', account: '+++++222'},
    2: {name: 'CV', id: 2, connected: false, server: 'aaa', account: '+++++222'},
    3: {name: 'CV', id: 3, connected: false, server: 'aaa', account: '+++++222'},
  };

  async _getItems(): Promise<IAccount[]> {
    return (this.store as IAccount[]);
  }
}
