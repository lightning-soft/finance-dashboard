import { Id, IPaginationParams } from 'communication';
import { IBaseItem } from 'communication';
import { IInstrument } from './instrument';

export enum Side {
  Short = 'Short',
  Long = 'Long',
  Closed = 'Closed',
}

export interface IPosition extends IBaseItem {
  accountId: Id;
  price: number;
  size: number;
  realized: number;
  unrealized: number;
  total: number;
  side: Side;
  status: PositionStatus;
  instrument?: IInstrument;
}

export enum PositionStatus {
  Open = 'Open', Close = 'Close'
}

export interface IPositionParams extends IPaginationParams {
  status: PositionStatus;
  instrument?: IInstrument;
}
