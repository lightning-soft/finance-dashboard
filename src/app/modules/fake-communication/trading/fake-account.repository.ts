import { IAccount } from 'communication';
import { FakeRepository } from '../common';

export class FakeAccountRepository extends FakeRepository<IAccount> {


  async _getItems(): Promise<IAccount[]> {
    return ([
      {name: 'CV', id: 1, connected: true, server: 'aaa', account: '+++++222'},
      {name: 'CV', id: 2, server: 'aaa', account: '+++++222'},
      {name: 'CV', id: 3, server: 'aaa', account: '+++++222'}

    ] as IAccount[]);
  }
}
