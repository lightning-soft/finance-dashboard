import { Id } from 'communication';
import { IConnection } from './connection';

export abstract class ConnectionContainer {
  abstract getConnectionByAccountId(accountId: Id): IConnection;
  abstract getConnection(connectionId: Id): IConnection;
}
