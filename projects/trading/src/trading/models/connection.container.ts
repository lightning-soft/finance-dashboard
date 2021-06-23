import { Id } from 'communication';
import { IConnection } from './connection';
import { IAccount } from './account';

export abstract class ConnectionContainer {
  abstract getConnectionByAccountId(accountId: Id): IConnection;
  abstract getAccountsByConnection(connectionId: Id): IAccount[];
  abstract getConnection(connectionId: Id): IConnection;
}
