import { IBaseItem } from 'communication';
import { Broker } from './broker.enum';

export interface IConnection extends IBaseItem {
  broker: Broker;
  name: string;
  username: string;
  password?: string;
  server: string;
  aggregatedQuotes: boolean;
  gateway: string;
  autoSavePassword: boolean;
  connectOnStartUp: boolean;
  connected: boolean;
  favourite: boolean;
  isDefault: boolean;
  error?: boolean;
  connectionData: any; // api key, ... etc
}
