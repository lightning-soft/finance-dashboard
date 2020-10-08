import { IBaseItem } from '../../common';

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
}
