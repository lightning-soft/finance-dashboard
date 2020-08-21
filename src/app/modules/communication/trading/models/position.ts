import {IBaseItem} from '../../common';

export interface IPosition extends IBaseItem{
  account: string;
  price: number;
  size: number;
  realized: number;
  unrealized: number;
  total: number;
  isLong: boolean;
}
