import { FakeRepository } from 'communication';
import { IAccount } from 'trading';

export class FakeAccountRepository extends FakeRepository<IAccount> {

  protected async _getItems(): Promise<IAccount[]> {
    return Array.from({ length: 3 }, (x, i) => {
      this._id++;

      return {
        ...this._getItemSample(),
        connected: !i,
      };
    });
  }

  protected _getItemSample(): IAccount {
    const id = this._id;

    return {
      id,
      name: 'CV',
      connected: false,
      server: 'aaa',
      account: '+++++222',
      connectionId: null,
    };
  }
}
