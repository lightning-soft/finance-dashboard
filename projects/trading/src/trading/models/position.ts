import { IBaseItem, Id, IPaginationParams } from 'communication';
import { IInstrument } from './instrument';
import { IAccount } from './account';

export enum Side {
  Short = 'Short',
  Long = 'Long',
  Closed = 'Closed',
}

export interface IPosition extends IBaseItem {
  accountId: Id;
  connectionId: Id;
  price: number;
  size: number;
  realized: number;
  unrealized: number;
  buyVolume: number;
  sellVolume: number;
  total: number;
  side: Side;
  status: PositionStatus;
  instrument: IInstrument;
  account?: IAccount;
  accountBalance?: number;
}

export enum PositionStatus {
  Open = 'Open', Close = 'Close'
}

export interface IPositionParams extends IPaginationParams {
  status: PositionStatus;
  instrument?: IInstrument;
}
