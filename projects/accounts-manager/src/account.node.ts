import { ConnectionDepNode } from '../../real-trading/src/trading/repositories/connections.factory';
import { IAccount, IConnection } from 'trading';
import { OnDestroy } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Id } from 'communication';

export interface IAccountNodeData<T = IConnection> {
  current: T[];
  prev: T[];
  created: T[];
  deleted: T[];
}

@UntilDestroy()
export abstract class AccountNodeSubscriber {
  // account: IAccount;

  // get accountId(): Id {
  //   return this.account?.id;
  // }

  // handleConnectionsChange(data: IAccountNodeData): void {}
  // handleConnectedConnectionsChange(data: IAccountNodeData): void {}

  // handleConnection(connection: IConnection): void {}

  // handleConnect(connection: IConnection) {
  //   this.initConnectionDeps();
  // }

  // handleDisconnect(connection: IConnection) {
  //   this.destroyConnectionDeps();
  // }

  // handleAccountsChange(data: IAccountNodeData<IAccount>): void {}
  // handleAccountChange(account: IAccount): void {}

  // ngOnDestroy() {
  //   this.destroyConnectionDeps();
  // }
}

export class AccountNode extends AccountNodeSubscriber {
}
