import { EventType } from './types';

export interface IMessage {
  sender: any;
  eventType: EventType;
  data: object | string | number;
}
