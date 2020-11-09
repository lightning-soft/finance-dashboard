import { IBaseItem } from '../common';
import { Broker } from './broker.enum';

export interface IBroker extends IBaseItem {
  name: Broker;
  title: string;
  logo: string;
  description: string;
}
