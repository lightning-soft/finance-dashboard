import { IBaseItem } from '../../common';

export interface IAccount  extends IBaseItem {
  name: string;
  account: string;
  server: string;
  connected?: boolean;
}
