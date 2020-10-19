import { FakeRepository } from 'communication';
import { IAccount } from 'trading';

export class FakeAccountRepository extends FakeRepository<IAccount> {


  async _getItems(): Promise<IAccount[]> {
    return ([
      {name: 'CV', id: 1, connected: true, server: 'aaa', account: '+++++222'},
      {name: 'CV', id: 2, server: 'aaa', account: '+++++222'},
      {name: 'CV', id: 3, server: 'aaa', account: '+++++222'}

    ] as IAccount[]);
  }
}
