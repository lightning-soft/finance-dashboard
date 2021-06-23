import { IBaseItem, Id } from 'communication';

export interface IAccount  extends IBaseItem {
  name: string;
  account: string;
  server: string;
  connectionId: Id;
  connected?: boolean;
  isDefault?: boolean;
}
