import { IBaseItem } from 'communication';
import { Broker } from './broker.enum';

export interface IBroker extends IBaseItem {
  name: Broker;
  title: string;
  logo: string;
  description: string;
}
