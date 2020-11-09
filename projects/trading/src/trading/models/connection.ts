import { IBaseItem } from 'communication';
import { Broker } from './broker.enum';

export interface IConnection extends IBaseItem {
  broker: Broker;
  name: string;
  username: string;
  connectionPointId: string;
  aggregatedQuotes: boolean;
  gateway: string;
  autoSavePassword: boolean;
  connectOnStartUp: boolean;
  connected: boolean;
  favourite: boolean;
}
