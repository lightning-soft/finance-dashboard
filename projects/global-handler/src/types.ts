import { IMessage } from './interfaces';

export type EventType = string;
export type Executor = (msg: IMessage) => void;
