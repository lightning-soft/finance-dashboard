import { IBaseItem } from '../common';
import { Broker } from '../services';

export interface IConnection extends IBaseItem {
  broker: Broker;
  name: string;
  username: string;
  connectionPointId: string;
  connected: boolean;
}
