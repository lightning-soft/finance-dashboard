import { IPaginationParams } from 'communication';
import { IBaseItem } from 'communication';
import { IInstrument } from './instruemnt';

export enum Side {
  Short = 'short',
  Long = 'long',
}

export interface IPosition extends IBaseItem {
  account: string;
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
